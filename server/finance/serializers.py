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


class BudgetSerializer(serializers.ModelSerializer):
    categoryId = CategoryReferenceField(source="category", queryset=Category.objects.all())
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Budget
        fields = ["id", "categoryId", "month", "amount", "createdAt"]


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
