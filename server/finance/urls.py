from rest_framework.routers import DefaultRouter

from finance.views import (
    AccountViewSet,
    BudgetViewSet,
    CategoryViewSet,
    SavingContributionViewSet,
    SavingViewSet,
    SavingWithdrawalViewSet,
    TransactionViewSet,
)


router = DefaultRouter()
router.register(r"accounts", AccountViewSet, basename="account")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"transactions", TransactionViewSet, basename="transaction")
router.register(r"budgets", BudgetViewSet, basename="budget")
router.register(r"savings", SavingViewSet, basename="saving")
router.register(r"saving-contributions", SavingContributionViewSet, basename="saving-contribution")
router.register(r"saving-withdrawals", SavingWithdrawalViewSet, basename="saving-withdrawal")

urlpatterns = router.urls
