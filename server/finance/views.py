from decimal import Decimal

from django.db import transaction
from django.db.models import Sum
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

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
from finance.services import (
    assert_transaction_is_allowed,
    build_dashboard_summary,
    can_delete_account,
    can_delete_category,
    can_delete_saving,
    get_internal_savings_category,
    get_saving_available_amount,
)


SYSTEM_CATEGORY_CODES = {item["code"] for item in DEFAULT_CATEGORIES if item["is_system"]}


class UserScopedViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)


def apply_month_filter(queryset, month):
    if not month or len(month) != 7 or month[4] != "-":
        return queryset

    year, month_number = month.split("-", 1)
    return queryset.filter(date__year=int(year), date__month=int(month_number))


class AccountViewSet(UserScopedViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        account = self.get_object()

        if not can_delete_account(account):
            raise ValidationError({"detail": "No puedes eliminar una cuenta con movimientos asociados."})

        return super().destroy(request, *args, **kwargs)


class CategoryViewSet(UserScopedViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        category = self.get_object()

        if category.is_system or category.code in SYSTEM_CATEGORY_CODES:
            raise ValidationError({"detail": "No puedes eliminar una categoría del sistema."})

        if category.transactions.exists() or category.budgets.exists():
            raise ValidationError({"detail": "No puedes eliminar una categoría con movimientos o presupuestos asociados."})

        if not can_delete_category(category):
            raise ValidationError({"detail": "No puedes eliminar una categoría con movimientos o presupuestos asociados."})

        return super().destroy(request, *args, **kwargs)


class TransactionViewSet(UserScopedViewSet):
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

        try:
            assert_transaction_is_allowed(account, transaction_type, amount)
        except ValueError as exc:
            raise ValidationError({"amount": str(exc)}) from exc

        serializer.save(user=self.request.user)

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

        try:
            assert_transaction_is_allowed(account, transaction_type, amount, exclude_transaction_id=instance.id)
        except ValueError as exc:
            raise ValidationError({"amount": str(exc)}) from exc

        serializer.save()


class BudgetViewSet(UserScopedViewSet):
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

        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        category = serializer.validated_data.get("category", self.get_object().category)

        if category.is_system:
            raise ValidationError({"categoryId": "No puedes crear presupuestos para categorías del sistema."})

        serializer.save()


class SavingViewSet(UserScopedViewSet):
    queryset = Saving.objects.all()
    serializer_class = SavingSerializer

    def perform_create(self, serializer):
        account = serializer.validated_data.get("account")
        initial_amount = serializer.validated_data.get("initial_amount") or Decimal("0")

        if initial_amount > 0 and account is None:
            raise ValidationError({"accountId": "Selecciona una cuenta para registrar el aporte inicial."})

        with transaction.atomic():
            saving = serializer.save(user=self.request.user, initial_amount=Decimal("0"))

            if initial_amount > 0 and account is not None:
                try:
                    assert_transaction_is_allowed(account, Transaction.TransactionType.EXPENSE, initial_amount)
                except ValueError as exc:
                    raise ValidationError({"amount": str(exc)}) from exc

                description = f"Aporte inicial de {saving.name}"

                SavingContribution.objects.create(
                    user=self.request.user,
                    saving=saving,
                    account=account,
                    amount=initial_amount,
                    description=description,
                    date=timezone.localdate(),
                )

                Transaction.objects.create(
                    user=self.request.user,
                    type=Transaction.TransactionType.EXPENSE,
                    amount=initial_amount,
                    category=get_internal_savings_category(self.request.user),
                    description=description,
                    date=timezone.localdate(),
                    account=account,
                    linked_saving=saving,
                    linked_saving_action=Transaction.SavingAction.CONTRIBUTION,
                )

    def destroy(self, request, *args, **kwargs):
        saving = self.get_object()

        if not can_delete_saving(saving):
            raise ValidationError({"detail": "No puedes eliminar un ahorro con movimientos asociados."})

        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"], url_path="contributions")
    def create_contribution(self, request, pk=None):
        saving = self.get_object()
        payload = request.data.copy()
        payload.setdefault("savingId", str(saving.id))

        serializer = SavingContributionSerializer(data=payload, context={"request": request})
        serializer.is_valid(raise_exception=True)

        account = serializer.validated_data["account"]
        amount = serializer.validated_data["amount"]

        try:
            assert_transaction_is_allowed(account, Transaction.TransactionType.EXPENSE, amount)
        except ValueError as exc:
            raise ValidationError({"amount": str(exc)}) from exc

        description = serializer.validated_data["description"].strip() or f"Abono de {saving.name}"
        date = serializer.validated_data["date"]

        with transaction.atomic():
            movement = SavingContribution.objects.create(
                user=request.user,
                saving=saving,
                account=account,
                amount=amount,
                description=description,
                date=date,
            )

            Transaction.objects.create(
                user=request.user,
                type=Transaction.TransactionType.EXPENSE,
                amount=amount,
                category=get_internal_savings_category(request.user),
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

        serializer = SavingWithdrawalSerializer(data=payload, context={"request": request})
        serializer.is_valid(raise_exception=True)

        account = serializer.validated_data["account"]
        amount = serializer.validated_data["amount"]

        available_amount = get_saving_available_amount(saving)
        if amount > available_amount:
            raise ValidationError({"amount": "El importe supera el valor disponible del ahorro."})

        description = serializer.validated_data["description"].strip() or f"Retiro de {saving.name}"
        date = serializer.validated_data["date"]

        with transaction.atomic():
            movement = SavingWithdrawal.objects.create(
                user=request.user,
                saving=saving,
                account=account,
                amount=amount,
                description=description,
                date=date,
            )

            Transaction.objects.create(
                user=request.user,
                type=Transaction.TransactionType.INCOME,
                amount=amount,
                category=get_internal_savings_category(request.user),
                description=description,
                date=date,
                account=account,
                linked_saving=saving,
                linked_saving_action=Transaction.SavingAction.WITHDRAWAL,
            )

        return Response(SavingWithdrawalSerializer(movement).data, status=status.HTTP_201_CREATED)


class SavingContributionViewSet(UserScopedViewSet):
    queryset = SavingContribution.objects.select_related("saving", "account")
    serializer_class = SavingContributionSerializer


class SavingWithdrawalViewSet(UserScopedViewSet):
    queryset = SavingWithdrawal.objects.select_related("saving", "account")
    serializer_class = SavingWithdrawalSerializer


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        selected_month = request.query_params.get("month")
        selected_category_id = request.query_params.get("categoryId")

        summary = build_dashboard_summary(
            accounts=Account.objects.filter(user=request.user),
            transactions=Transaction.objects.filter(user=request.user).select_related("account", "category", "linked_saving"),
            budgets=Budget.objects.filter(user=request.user).select_related("category"),
            categories=Category.objects.filter(user=request.user),
            selected_month=selected_month,
            selected_category_id=selected_category_id,
        )

        return Response(
            {
                **summary,
                "recentTransactions": TransactionSerializer(summary["recentTransactions"], many=True, context={"request": request}).data,
                "monthlyBudgets": BudgetSerializer(summary["monthlyBudgets"], many=True, context={"request": request}).data,
            }
        )


class StateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        selected_month = request.query_params.get("month")
        selected_category_id = request.query_params.get("categoryId")

        return Response(
            {
                "accounts": AccountSerializer(Account.objects.filter(user=request.user), many=True, context={"request": request}).data,
                "categories": CategorySerializer(Category.objects.filter(user=request.user), many=True, context={"request": request}).data,
                "transactions": TransactionSerializer(Transaction.objects.filter(user=request.user), many=True, context={"request": request}).data,
                "budgets": BudgetSerializer(Budget.objects.filter(user=request.user), many=True, context={"request": request}).data,
                "savings": SavingSerializer(Saving.objects.filter(user=request.user), many=True, context={"request": request}).data,
                "savingContributions": SavingContributionSerializer(SavingContribution.objects.filter(user=request.user), many=True, context={"request": request}).data,
                "savingWithdrawals": SavingWithdrawalSerializer(SavingWithdrawal.objects.filter(user=request.user), many=True, context={"request": request}).data,
                "selectedMonth": selected_month,
                "selectedCategoryId": selected_category_id,
            }
        )
