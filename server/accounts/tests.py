from unittest.mock import patch

from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from finance.constants import DEFAULT_CATEGORIES
from finance.models import Category
from accounts.models import UserPreference


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
        self.assertIsNotNone(register_response.data["user"].get("lastLogin"))

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

    def test_me_can_update_profile(self):
        register_response = self.client.post("/api/auth/register/", self.register_payload, format="json")
        access_token = register_response.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        response = self.client.patch(
            "/api/auth/me/",
            {
                "firstName": "Juanito",
                "lastName": "Pérez Gómez",
                "avatarUrl": "https://example.com/avatar.png",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["firstName"], "Juanito")
        self.assertEqual(response.data["lastName"], "Pérez Gómez")
        self.assertEqual(response.data["avatarUrl"], "https://example.com/avatar.png")

    def test_preferences_default_and_update(self):
        register_response = self.client.post("/api/auth/register/", self.register_payload, format="json")
        access_token = register_response.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        preferences_response = self.client.get("/api/auth/preferences/")
        self.assertEqual(preferences_response.status_code, status.HTTP_200_OK)
        self.assertEqual(preferences_response.data["currency"], "USD")
        self.assertEqual(preferences_response.data["theme"], "dark")
        self.assertEqual(preferences_response.data["language"], "es")

        update_response = self.client.patch(
            "/api/auth/preferences/",
            {"currency": "CLP", "theme": "light", "language": "en"},
            format="json",
        )

        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["currency"], "CLP")
        self.assertEqual(update_response.data["theme"], "light")
        self.assertEqual(update_response.data["language"], "en")

    def test_change_password(self):
        register_response = self.client.post("/api/auth/register/", self.register_payload, format="json")
        access_token = register_response.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        response = self.client.post(
            "/api/auth/change-password/",
            {
                "currentPassword": self.register_payload["password"],
                "newPassword": "new-password-segura-123",
                "confirmPassword": "new-password-segura-123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        login_response = self.client.post(
            "/api/auth/login/",
            {"email": self.register_payload["email"], "password": "new-password-segura-123"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

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
        self.assertTrue(UserPreference.objects.filter(user__email="google@example.com").exists())

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
