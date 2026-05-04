from unittest.mock import patch

from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from finance.constants import DEFAULT_CATEGORIES
from finance.models import Category


class AuthFlowTests(APITestCase):
    def setUp(self):
        self.register_payload = {
            "firstName": "Juan",
            "lastName": "Pérez",
            "email": "juan@example.com",
            "password": "password-seguro-123",
        }

    def test_register_and_login(self):
        register_response = self.client.post("/api/auth/register/", self.register_payload, format="json")

        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", register_response.data)
        self.assertIn("refresh", register_response.data)
        self.assertIn("user", register_response.data)

        login_response = self.client.post(
            "/api/auth/login/",
            {"email": self.register_payload["email"], "password": self.register_payload["password"]},
            format="json",
        )

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", login_response.data)
        self.assertIn("refresh", login_response.data)

    def test_me_requires_and_returns_authenticated_user(self):
        register_response = self.client.post("/api/auth/register/", self.register_payload, format="json")
        access_token = register_response.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        me_response = self.client.get("/api/auth/me/")

        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data["email"], self.register_payload["email"])
        self.assertEqual(me_response.data["firstName"], self.register_payload["firstName"])

    @patch("accounts.views.google_id_token.verify_oauth2_token")
    @override_settings(GOOGLE_CLIENT_ID="test-client-id")
    def test_google_auth_creates_user_and_categories(self, mock_verify):
        mock_verify.return_value = {
            "email": "google@example.com",
            "email_verified": True,
            "given_name": "Google",
            "family_name": "User",
            "picture": "https://example.com/avatar.png",
            "sub": "google-sub-123",
        }

        response = self.client.post("/api/auth/google/", {"idToken": "fake-token"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["email"], "google@example.com")
        self.assertEqual(Category.objects.filter(user__email="google@example.com").count(), len(DEFAULT_CATEGORIES))

    def test_refresh_and_logout(self):
        register_response = self.client.post("/api/auth/register/", self.register_payload, format="json")
        refresh_token = register_response.data["refresh"]

        refresh_response = self.client.post("/api/auth/refresh/", {"refresh": refresh_token}, format="json")
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_response.data)

        logout_response = self.client.post("/api/auth/logout/", {"refresh": refresh_token}, format="json")
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)

        refresh_after_logout = self.client.post("/api/auth/refresh/", {"refresh": refresh_token}, format="json")
        self.assertNotEqual(refresh_after_logout.status_code, status.HTTP_200_OK)
