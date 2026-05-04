from rest_framework import status
from rest_framework.test import APITestCase


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
