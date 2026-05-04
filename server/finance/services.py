from decimal import Decimal

from django.db.models import Sum
from django.db.models.functions import Coalesce

from finance.constants import DEFAULT_CATEGORIES
from finance.models import Account, Budget, Category, Saving, Transaction


def create_default_categories_for_user(user):
    for category_data in DEFAULT_CATEGORIES:
        Category.objects.get_or_create(
            user=user,
            code=category_data["code"],
            defaults={
                "name": category_data["name"],
                "emoji": category_data["emoji"],
                "color": category_data["color"],
                "is_system": category_data["is_system"],
            },
        )


def get_category_for_user(user, code):
    category = Category.objects.filter(user=user, code=code).first()
    if category is not None:
        return category

    return Category.objects.filter(user__isnull=True, code=code).first()


def apply_month_filter(queryset, month, field_name="date"):
    if not month or len(month) != 7 or month[4] != "-":
        return queryset

    year, month_number = month.split("-", 1)
    return queryset.filter(**{f"{field_name}__year": int(year), f"{field_name}__month": int(month_number)})


def get_account_balance(account: Account, exclude_transaction_id=None):
    transactions = account.transactions.all()

    if exclude_transaction_id is not None:
        transactions = transactions.exclude(id=exclude_transaction_id)

    income = transactions.filter(type=Transaction.TransactionType.INCOME).aggregate(total=Coalesce(Sum("amount"), Decimal("0")))["total"]
    expenses = transactions.filter(type=Transaction.TransactionType.EXPENSE).aggregate(total=Coalesce(Sum("amount"), Decimal("0")))["total"]
    return account.initial_balance + income - expenses


def can_delete_account(account: Account) -> bool:
    return not account.transactions.exists()


def can_delete_category(category: Category) -> bool:
    return not category.transactions.exists() and not category.budgets.exists() and not category.is_system


def can_delete_saving(saving: Saving) -> bool:
    return not saving.contributions.exists() and not saving.withdrawals.exists()


def assert_transaction_is_allowed(account: Account, transaction_type: str, amount, exclude_transaction_id=None):
    if transaction_type != Transaction.TransactionType.EXPENSE:
        return

    available_balance = get_account_balance(account, exclude_transaction_id=exclude_transaction_id)
    if amount > available_balance:
        raise ValueError("El importe supera el saldo disponible de esta cuenta.")


def get_saving_available_amount(saving: Saving):
    contributions_total = saving.contributions.aggregate(total=Coalesce(Sum("amount"), Decimal("0")))["total"]
    withdrawals_total = saving.withdrawals.aggregate(total=Coalesce(Sum("amount"), Decimal("0")))["total"]
    return saving.initial_amount + contributions_total - withdrawals_total


def get_internal_savings_category(user):
    category = Category.objects.filter(user=user, code="category-savings").first()
    if category is None:
        category = Category.objects.filter(user__isnull=True, code="category-savings").first()
    if category is None:
        raise Category.DoesNotExist("No existe la categoría de ahorros.")
    return category


def get_category_breakdown(transactions, categories):
    totals = {}

    for transaction in transactions:
        if transaction.type != Transaction.TransactionType.EXPENSE:
            continue

        category = categories.get(transaction.category_id)
        bucket = totals.setdefault(
            transaction.category_id,
            {
                "categoryId": transaction.category_id,
                "categoryName": category.name if category else "Unknown",
                "emoji": category.emoji if category else "❓",
                "color": category.color if category else "#94a3b8",
                "amount": Decimal("0"),
                "transactionCount": 0,
            },
        )
        bucket["amount"] += transaction.amount
        bucket["transactionCount"] += 1

    return sorted(totals.values(), key=lambda item: item["amount"], reverse=True)


def build_dashboard_summary(accounts, transactions, budgets, categories, selected_month, selected_category_id=None):
    filtered_transactions = transactions
    if selected_month:
        filtered_transactions = apply_month_filter(filtered_transactions, selected_month)
    if selected_category_id:
        filtered_transactions = filtered_transactions.filter(category_id=selected_category_id)

    total_balance = sum((account.initial_balance for account in accounts), Decimal("0"))
    total_balance += transactions.filter(type=Transaction.TransactionType.INCOME).aggregate(total=Coalesce(Sum("amount"), Decimal("0")))["total"]
    total_balance -= transactions.filter(type=Transaction.TransactionType.EXPENSE).aggregate(total=Coalesce(Sum("amount"), Decimal("0")))["total"]

    monthly_income = filtered_transactions.filter(type=Transaction.TransactionType.INCOME).aggregate(total=Coalesce(Sum("amount"), Decimal("0")))["total"]
    monthly_expenses = filtered_transactions.filter(type=Transaction.TransactionType.EXPENSE).aggregate(total=Coalesce(Sum("amount"), Decimal("0")))["total"]

    category_map = {category.id: category for category in categories}
    category_breakdown = get_category_breakdown(filtered_transactions, category_map)

    recent_transactions = list(filtered_transactions.order_by("-date", "-created_at")[:5])
    monthly_budgets = list(budgets.filter(month=selected_month).order_by("category__name")) if selected_month else []

    return {
        "totalBalance": total_balance,
        "monthlyIncome": monthly_income,
        "monthlyExpenses": monthly_expenses,
        "categoryBreakdown": category_breakdown,
        "recentTransactions": recent_transactions,
        "monthlyBudgets": monthly_budgets,
    }
