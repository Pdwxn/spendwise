from django.urls import path

from .views import ChangePasswordView, GoogleAuthView, LoginView, LogoutView, MeView, PreferenceView, RefreshView, RegisterView


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("google/", GoogleAuthView.as_view(), name="google-auth"),
    path("me/", MeView.as_view(), name="me"),
    path("preferences/", PreferenceView.as_view(), name="preferences"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("refresh/", RefreshView.as_view(), name="refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
