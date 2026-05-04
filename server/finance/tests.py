from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from finance.constants import DEFAULT_CATEGORIES
from finance.models import Account, Budget, Category, Saving, SavingContribution, SavingWithdrawal, Transaction


User = get_user_model()


class FinanceOwnershipTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            email="user1@example.com",
            password="password-seguro-123",
            first_name="User",
            last_name="One",
        )
        self.user2 = User.objects.create_user(
            email="user2@example.com",
            password="password-seguro-123",
            first_name="User",
            last_name="Two",
        )
        self.user1_account = Account.objects.create(
            user=self.user1,
            name="Cuenta 1",
            initial_balance=Decimal("100.00"),
            color="#111111",
        )
        self.user2_account = Account.objects.create(
            user=self.user2,
            name="Cuenta 2",
            initial_balance=Decimal("100.00"),
            color="#222222",
        )
        self.user1_food = Category.objects.get(user=self.user1, code="category-food")
        self.user1_income = Category.objects.get(user=self.user1, code="category-income")

    def test_default_categories_are_created_for_each_user(self):
        self.assertEqual(Category.objects.filter(user=self.user1).count(), len(DEFAULT_CATEGORIES))
        self.assertEqual(Category.objects.filter(user=self.user2).count(), len(DEFAULT_CATEGORIES))

    def test_finance_endpoints_require_authentication(self):
        response = self.client.get("/api/accounts/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_finance_endpoints_are_scoped_to_authenticated_user(self):
        self.client.force_authenticate(user=self.user1)

        response = self.client.get("/api/accounts/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], str(self.user1_account.id))

    def test_foreign_account_cannot_be_used_in_transaction(self):
        self.client.force_authenticate(user=self.user1)

        response = self.client.post(
            "/api/transactions/",
            {
                "type": "expense",
                "amount": 10,
                "categoryId": self.user1_food.id,
                "description": "Compra ajena",
                "date": "2026-05-04",
                "accountId": str(self.user2_account.id),
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("accountId", response.data)

    def test_transaction_can_be_created_with_owned_resources(self):
        self.client.force_authenticate(user=self.user1)

        response = self.client.post(
            "/api/transactions/",
            {
                "type": "income",
                "amount": 50,
                "categoryId": self.user1_income.id,
                "description": "Ingreso propio",
                "date": "2026-05-04",
                "accountId": str(self.user1_account.id),
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Transaction.objects.filter(user=self.user1).count(), 1)

    def test_state_endpoint_returns_only_authenticated_user_data(self):
        self.client.force_authenticate(user=self.user1)

        Transaction.objects.create(
            user=self.user1,
            type="income",
            amount=Decimal("200.00"),
            category=self.user1_income,
            description="Salario",
            date="2026-05-04",
            account=self.user1_account,
        )
        Budget.objects.create(user=self.user1, category=self.user1_food, month="2026-05", amount=Decimal("300.00"))
        saving = Saving.objects.create(user=self.user1, name="Fondo", initial_amount=Decimal("10.00"), mode="static")
        SavingContribution.objects.create(
            user=self.user1,
            saving=saving,
            account=self.user1_account,
            amount=Decimal("5.00"),
            description="Abono",
            date="2026-05-04",
        )
        SavingWithdrawal.objects.create(
            user=self.user1,
            saving=saving,
            account=self.user1_account,
            amount=Decimal("2.00"),
            description="Retiro",
            date="2026-05-04",
        )

        response = self.client.get("/api/state/", {"month": "2026-05"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["accounts"]), 1)
        self.assertEqual(len(response.data["categories"]), len(DEFAULT_CATEGORIES))
        self.assertEqual(len(response.data["transactions"]), 1)
        self.assertEqual(len(response.data["budgets"]), 1)
        self.assertEqual(len(response.data["savings"]), 1)
        self.assertEqual(len(response.data["savingContributions"]), 1)
        self.assertEqual(len(response.data["savingWithdrawals"]), 1)

    def test_dashboard_endpoint_returns_only_authenticated_user_data(self):
        self.client.force_authenticate(user=self.user1)

        Transaction.objects.create(
            user=self.user1,
            type="income",
            amount=Decimal("200.00"),
            category=self.user1_income,
            description="Salario",
            date="2026-05-04",
            account=self.user1_account,
        )
        Transaction.objects.create(
            user=self.user1,
            type="expense",
            amount=Decimal("50.00"),
            category=self.user1_food,
            description="Mercado",
            date="2026-05-04",
            account=self.user1_account,
        )
        Transaction.objects.create(
            user=self.user2,
            type="expense",
            amount=Decimal("999.00"),
            category=Category.objects.get(user=self.user2, code="category-food"),
            description="No debe contar",
            date="2026-05-04",
            account=self.user2_account,
        )
        Budget.objects.create(user=self.user1, category=self.user1_food, month="2026-05", amount=Decimal("300.00"))

        response = self.client.get("/api/dashboard/", {"month": "2026-05"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(str(response.data["monthlyIncome"])), Decimal("200.00"))
        self.assertEqual(Decimal(str(response.data["monthlyExpenses"])), Decimal("50.00"))
        self.assertEqual(len(response.data["recentTransactions"]), 2)
        self.assertEqual(len(response.data["monthlyBudgets"]), 1)
