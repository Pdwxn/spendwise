import uuid

from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class Account(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    initial_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    color = models.CharField(max_length=16)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name


class Category(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    emoji = models.CharField(max_length=16)
    color = models.CharField(max_length=16)
    code = models.CharField(max_length=64, unique=True, null=True, blank=True)
    is_system = models.BooleanField(default=False)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Transaction(TimeStampedModel):
    class TransactionType(models.TextChoices):
        INCOME = "income", "Income"
        EXPENSE = "expense", "Expense"

    class SavingAction(models.TextChoices):
        CONTRIBUTION = "contribution", "Contribution"
        WITHDRAWAL = "withdrawal", "Withdrawal"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.CharField(max_length=16, choices=TransactionType.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="transactions")
    description = models.CharField(max_length=255)
    date = models.DateField()
    account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name="transactions")
    linked_saving = models.ForeignKey(
        "Saving",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transactions",
    )
    linked_saving_action = models.CharField(
        max_length=16,
        choices=SavingAction.choices,
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self) -> str:
        return f"{self.type} {self.amount}"


class Budget(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="budgets")
    month = models.CharField(max_length=7)
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        ordering = ["-month", "category__name"]
        constraints = [
            models.UniqueConstraint(fields=["category", "month"], name="unique_budget_category_month"),
        ]

    def __str__(self) -> str:
        return f"{self.category} {self.month}"


class Saving(TimeStampedModel):
    class SavingMode(models.TextChoices):
        STATIC = "static", "Static"
        ANNUAL_PERCENTAGE = "annualPercentage", "Annual Percentage"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    initial_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    mode = models.CharField(max_length=32, choices=SavingMode.choices)
    annual_percentage = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name


class SavingContribution(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    saving = models.ForeignKey(Saving, on_delete=models.PROTECT, related_name="contributions")
    account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name="saving_contributions")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255)
    date = models.DateField()

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self) -> str:
        return f"Contribution {self.amount}"


class SavingWithdrawal(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    saving = models.ForeignKey(Saving, on_delete=models.PROTECT, related_name="withdrawals")
    account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name="saving_withdrawals")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255)
    date = models.DateField()

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self) -> str:
        return f"Withdrawal {self.amount}"
