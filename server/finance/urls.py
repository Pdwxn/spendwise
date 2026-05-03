from rest_framework.routers import DefaultRouter

from finance.views import AccountViewSet, CategoryViewSet


router = DefaultRouter()
router.register(r"accounts", AccountViewSet, basename="account")
router.register(r"categories", CategoryViewSet, basename="category")

urlpatterns = router.urls
