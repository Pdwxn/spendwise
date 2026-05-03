from decimal import Decimal

from django.db import transaction
from django.db.models import Sum
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from finance.constants import DEFAULT_CATEGORIES
from finance.models import Account, Budget, Category, Saving, SavingContribution, SavingWithdrawal, Transaction
from finance.serializers import (
    AccountSerializer,
    BudgetSerializer,
    CategorySerializer,
    SavingContributionSerializer,
    SavingSerializer,
    SavingWithdrawalSerializer,
    TransactionSerializer,
)


SYSTEM_CATEGORY_CODES = {item["code"] for item in DEFAULT_CATEGORIES if item["is_system"]}


def apply_month_filter(queryset, month):
    if not month or len(month) != 7 or month[4] != "-":
        return queryset

    year, month_number = month.split("-", 1)
    return queryset.filter(date__year=int(year), date__month=int(month_number))


def get_account_balance(account: Account, exclude_transaction_id=None):
    transactions = account.transactions.all()

    if exclude_transaction_id is not None:
        transactions = transactions.exclude(id=exclude_transaction_id)

    income = transactions.filter(type=Transaction.TransactionType.INCOME).aggregate(total=Coalesce(Sum("amount"), Decimal("0")))["total"]
    expenses = transactions.filter(type=Transaction.TransactionType.EXPENSE).aggregate(total=Coalesce(Sum("amount"), Decimal("0")))["total"]
    return account.initial_balance + income - expenses


def assert_transaction_is_allowed(account: Account, transaction_type: str, amount, exclude_transaction_id=None):
    if transaction_type != Transaction.TransactionType.EXPENSE:
        return

    available_balance = get_account_balance(account, exclude_transaction_id=exclude_transaction_id)
    if amount > available_balance:
        raise ValidationError({"amount": "El importe supera el saldo disponible de esta cuenta."})


def get_saving_available_amount(saving: Saving):
    contributions_total = saving.contributions.aggregate(total=Coalesce(Sum("amount"), Decimal("0")))["total"]
    withdrawals_total = saving.withdrawals.aggregate(total=Coalesce(Sum("amount"), Decimal("0")))["total"]
    return saving.initial_amount + contributions_total - withdrawals_total


def get_internal_savings_category():
    return Category.objects.get(code="category-savings")


class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

    def destroy(self, request, *args, **kwargs):
        account = self.get_object()

        if account.transactions.exists():
            raise ValidationError({"detail": "No puedes eliminar una cuenta con movimientos asociados."})

        return super().destroy(request, *args, **kwargs)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def destroy(self, request, *args, **kwargs):
        category = self.get_object()

        if category.is_system or category.code in SYSTEM_CATEGORY_CODES:
            raise ValidationError({"detail": "No puedes eliminar una categoría del sistema."})

        if category.transactions.exists() or category.budgets.exists():
            raise ValidationError({"detail": "No puedes eliminar una categoría con movimientos o presupuestos asociados."})

        return super().destroy(request, *args, **kwargs)


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.select_related("account", "category", "linked_saving")
    serializer_class = TransactionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        month = self.request.query_params.get("month")
        category_id = self.request.query_params.get("categoryId")
        account_id = self.request.query_params.get("accountId")

        if month:
            queryset = apply_month_filter(queryset, month)

        if category_id:
            queryset = queryset.filter(category_id=category_id)

        if account_id:
            queryset = queryset.filter(account_id=account_id)

        return queryset

    def perform_create(self, serializer):
        account = serializer.validated_data["account"]
        transaction_type = serializer.validated_data["type"]
        amount = serializer.validated_data["amount"]
        category = serializer.validated_data["category"]
        linked_saving_action = serializer.validated_data.get("linked_saving_action")
        is_internal_saving = linked_saving_action is not None or serializer.validated_data.get("linked_saving") is not None

        if transaction_type == Transaction.TransactionType.INCOME and category.code != "category-income":
            raise ValidationError({"categoryId": "Los ingresos deben usar la categoría interna de ingresos."})

        if transaction_type == Transaction.TransactionType.EXPENSE and category.is_system and not is_internal_saving:
            raise ValidationError({"categoryId": "Los gastos no pueden usar categorías del sistema."})

        if category.code == "category-savings" and not is_internal_saving:
            raise ValidationError({"categoryId": "La categoría de ahorros solo puede usarse en movimientos internos."})

        assert_transaction_is_allowed(account, transaction_type, amount)
        serializer.save()

    def perform_update(self, serializer):
        instance = self.get_object()
        account = serializer.validated_data.get("account", instance.account)
        transaction_type = serializer.validated_data.get("type", instance.type)
        amount = serializer.validated_data.get("amount", instance.amount)
        category = serializer.validated_data.get("category", instance.category)
        linked_saving_action = serializer.validated_data.get("linked_saving_action", instance.linked_saving_action)
        is_internal_saving = linked_saving_action is not None or serializer.validated_data.get("linked_saving", instance.linked_saving) is not None

        if transaction_type == Transaction.TransactionType.INCOME and category.code != "category-income":
            raise ValidationError({"categoryId": "Los ingresos deben usar la categoría interna de ingresos."})

        if transaction_type == Transaction.TransactionType.EXPENSE and category.is_system and not is_internal_saving:
            raise ValidationError({"categoryId": "Los gastos no pueden usar categorías del sistema."})

        if category.code == "category-savings" and not is_internal_saving:
            raise ValidationError({"categoryId": "La categoría de ahorros solo puede usarse en movimientos internos."})

        assert_transaction_is_allowed(account, transaction_type, amount, exclude_transaction_id=instance.id)
        serializer.save()


class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.select_related("category")
    serializer_class = BudgetSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        month = self.request.query_params.get("month")
        category_id = self.request.query_params.get("categoryId")

        if month:
            queryset = queryset.filter(month=month)

        if category_id:
            queryset = queryset.filter(category_id=category_id)

        return queryset

    def perform_create(self, serializer):
        category = serializer.validated_data["category"]

        if category.is_system:
            raise ValidationError({"categoryId": "No puedes crear presupuestos para categorías del sistema."})

        serializer.save()

    def perform_update(self, serializer):
        category = serializer.validated_data.get("category", self.get_object().category)

        if category.is_system:
            raise ValidationError({"categoryId": "No puedes crear presupuestos para categorías del sistema."})

        serializer.save()


class SavingViewSet(viewsets.ModelViewSet):
    queryset = Saving.objects.all()
    serializer_class = SavingSerializer

    def destroy(self, request, *args, **kwargs):
        saving = self.get_object()

        if saving.contributions.exists() or saving.withdrawals.exists():
            raise ValidationError({"detail": "No puedes eliminar un ahorro con movimientos asociados."})

        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"], url_path="contributions")
    def create_contribution(self, request, pk=None):
        saving = self.get_object()
        payload = request.data.copy()
        payload.setdefault("savingId", str(saving.id))

        serializer = SavingContributionSerializer(data=payload)
        serializer.is_valid(raise_exception=True)

        account = serializer.validated_data["account"]
        amount = serializer.validated_data["amount"]
        if amount <= 0:
            raise ValidationError({"amount": "El importe debe ser mayor que 0."})

        assert_transaction_is_allowed(account, Transaction.TransactionType.EXPENSE, amount)

        description = serializer.validated_data["description"].strip() or f"Abono de {saving.name}"
        date = serializer.validated_data["date"]

        with transaction.atomic():
            movement = SavingContribution.objects.create(
                saving=saving,
                account=account,
                amount=amount,
                description=description,
                date=date,
            )

            Transaction.objects.create(
                type=Transaction.TransactionType.EXPENSE,
                amount=amount,
                category=get_internal_savings_category(),
                description=description,
                date=date,
                account=account,
                linked_saving=saving,
                linked_saving_action=Transaction.SavingAction.CONTRIBUTION,
            )

        return Response(SavingContributionSerializer(movement).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="withdrawals")
    def create_withdrawal(self, request, pk=None):
        saving = self.get_object()
        payload = request.data.copy()
        payload.setdefault("savingId", str(saving.id))

        serializer = SavingWithdrawalSerializer(data=payload)
        serializer.is_valid(raise_exception=True)

        account = serializer.validated_data["account"]
        amount = serializer.validated_data["amount"]
        if amount <= 0:
            raise ValidationError({"amount": "El importe debe ser mayor que 0."})

        available_amount = get_saving_available_amount(saving)
        if amount > available_amount:
            raise ValidationError({"amount": "El importe supera el valor disponible del ahorro."})

        description = serializer.validated_data["description"].strip() or f"Retiro de {saving.name}"
        date = serializer.validated_data["date"]

        with transaction.atomic():
            movement = SavingWithdrawal.objects.create(
                saving=saving,
                account=account,
                amount=amount,
                description=description,
                date=date,
            )

            Transaction.objects.create(
                type=Transaction.TransactionType.INCOME,
                amount=amount,
                category=get_internal_savings_category(),
                description=description,
                date=date,
                account=account,
                linked_saving=saving,
                linked_saving_action=Transaction.SavingAction.WITHDRAWAL,
            )

        return Response(SavingWithdrawalSerializer(movement).data, status=status.HTTP_201_CREATED)


class SavingContributionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SavingContribution.objects.select_related("saving", "account")
    serializer_class = SavingContributionSerializer


class SavingWithdrawalViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SavingWithdrawal.objects.select_related("saving", "account")
    serializer_class = SavingWithdrawalSerializer
