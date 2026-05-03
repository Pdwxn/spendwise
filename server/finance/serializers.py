from rest_framework import serializers

from .models import Account, Budget, Category, Saving, SavingContribution, SavingWithdrawal, Transaction


def public_identifier(instance):
    code = getattr(instance, "code", None)
    return code or str(instance.pk)


class CategoryReferenceField(serializers.PrimaryKeyRelatedField):
    def to_internal_value(self, data):
        queryset = self.get_queryset()

        try:
            return queryset.get(pk=data)
        except (queryset.model.DoesNotExist, TypeError, ValueError, serializers.ValidationError):
            if hasattr(queryset.model, "code"):
                try:
                    return queryset.get(code=data)
                except queryset.model.DoesNotExist as exc:
                    raise serializers.ValidationError("Categoría no encontrada.") from exc

        raise serializers.ValidationError("Categoría no encontrada.")

    def to_representation(self, value):
        return public_identifier(value)


class AccountSerializer(serializers.ModelSerializer):
    initialBalance = serializers.DecimalField(source="initial_balance", max_digits=12, decimal_places=2)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Account
        fields = ["id", "name", "initialBalance", "color", "createdAt"]


class CategorySerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "emoji", "color", "createdAt"]

    def get_id(self, obj):
        return public_identifier(obj)


class SavingSerializer(serializers.ModelSerializer):
    initialAmount = serializers.DecimalField(source="initial_amount", max_digits=12, decimal_places=2)
    annualPercentage = serializers.DecimalField(
        source="annual_percentage",
        max_digits=6,
        decimal_places=2,
        required=False,
        allow_null=True,
    )
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Saving
        fields = ["id", "name", "initialAmount", "mode", "annualPercentage", "createdAt"]

    def validate(self, attrs):
        mode = attrs.get("mode") or getattr(self.instance, "mode", None)
        annual_percentage = attrs.get("annual_percentage") if "annual_percentage" in attrs else getattr(self.instance, "annual_percentage", None)

        if mode == "annualPercentage" and annual_percentage is None:
            raise serializers.ValidationError({"annualPercentage": "El porcentaje anual es obligatorio para este modo."})

        if mode == "static" and annual_percentage not in (None, 0):
            raise serializers.ValidationError({"annualPercentage": "El porcentaje anual no aplica para el modo fijo."})

        return attrs


class TransactionSerializer(serializers.ModelSerializer):
    categoryId = CategoryReferenceField(source="category", queryset=Category.objects.all())
    accountId = serializers.PrimaryKeyRelatedField(source="account", queryset=Account.objects.all())
    linkedSavingId = serializers.PrimaryKeyRelatedField(
        source="linked_saving",
        queryset=Saving.objects.all(),
        required=False,
        allow_null=True,
    )
    linkedSavingAction = serializers.CharField(source="linked_saving_action", required=False, allow_null=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Transaction
        fields = [
            "id",
            "type",
            "amount",
            "categoryId",
            "description",
            "date",
            "accountId",
            "linkedSavingId",
            "linkedSavingAction",
            "createdAt",
        ]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("El importe debe ser mayor que 0.")

        return value

    def validate(self, attrs):
        category = attrs.get("category") or getattr(self.instance, "category", None)
        linked_saving = attrs.get("linked_saving") or getattr(self.instance, "linked_saving", None)
        linked_saving_action = attrs.get("linked_saving_action") or getattr(self.instance, "linked_saving_action", None)
        is_internal_saving = linked_saving is not None or linked_saving_action is not None

        if category and getattr(category, "is_system", False) and category.code not in {"category-income", "category-savings"}:
            raise serializers.ValidationError({"categoryId": "No puedes usar una categoría del sistema para este movimiento."})

        if category and category.code == "category-savings" and not is_internal_saving:
            raise serializers.ValidationError({"categoryId": "La categoría de ahorros solo puede usarse en movimientos internos."})

        if category and category.code == "category-income" and attrs.get("type") == Transaction.TransactionType.EXPENSE:
            raise serializers.ValidationError({"categoryId": "Los gastos no pueden usar la categoría interna de ingresos."})

        return attrs


class BudgetSerializer(serializers.ModelSerializer):
    categoryId = CategoryReferenceField(source="category", queryset=Category.objects.all())
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Budget
        fields = ["id", "categoryId", "month", "amount", "createdAt"]

    def validate_month(self, value):
        if len(value) != 7 or value[4] != "-":
            raise serializers.ValidationError("El mes debe tener formato YYYY-MM.")

        return value

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("El importe debe ser mayor que 0.")

        return value


class SavingContributionSerializer(serializers.ModelSerializer):
    savingId = serializers.PrimaryKeyRelatedField(source="saving", queryset=Saving.objects.all())
    accountId = serializers.PrimaryKeyRelatedField(source="account", queryset=Account.objects.all())
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = SavingContribution
        fields = ["id", "savingId", "accountId", "amount", "description", "date", "createdAt"]


class SavingWithdrawalSerializer(serializers.ModelSerializer):
    savingId = serializers.PrimaryKeyRelatedField(source="saving", queryset=Saving.objects.all())
    accountId = serializers.PrimaryKeyRelatedField(source="account", queryset=Account.objects.all())
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = SavingWithdrawal
        fields = ["id", "savingId", "accountId", "amount", "description", "date", "createdAt"]
