from rest_framework import viewsets
from rest_framework.exceptions import ValidationError

from finance.constants import DEFAULT_CATEGORIES
from finance.models import Account, Category
from finance.serializers import AccountSerializer, CategorySerializer


SYSTEM_CATEGORY_CODES = {item["code"] for item in DEFAULT_CATEGORIES if item["is_system"]}


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

        if category.is_system or (category.code in SYSTEM_CATEGORY_CODES):
            raise ValidationError({"detail": "No puedes eliminar una categoría del sistema."})

        if category.transactions.exists() or category.budgets.exists():
            raise ValidationError({"detail": "No puedes eliminar una categoría con movimientos o presupuestos asociados."})

        return super().destroy(request, *args, **kwargs)
