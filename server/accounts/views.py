from django.conf import settings
from django.contrib.auth.models import update_last_login
from django.db import transaction
from google.auth.exceptions import GoogleAuthError
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import id_token as google_id_token
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CustomUser
from .serializers import (
    GoogleAuthSerializer,
    LoginSerializer,
    LogoutSerializer,
    RegisterSerializer,
    UserSerializer,
    build_tokens,
)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            user = serializer.save()

        tokens = build_tokens(user)
        return Response({**tokens, "user": UserSerializer(user).data}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        update_last_login(None, user)
        tokens = build_tokens(user)
        return Response({**tokens, "user": UserSerializer(user).data}, status=status.HTTP_200_OK)


class GoogleAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not settings.GOOGLE_CLIENT_ID:
            return Response({"detail": "GOOGLE_CLIENT_ID no está configurado."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            payload = google_id_token.verify_oauth2_token(
                serializer.validated_data["idToken"],
                GoogleRequest(),
                settings.GOOGLE_CLIENT_ID,
            )
        except (ValueError, GoogleAuthError):
            return Response({"detail": "Token de Google inválido."}, status=status.HTTP_400_BAD_REQUEST)

        email = payload.get("email")
        email_verified = payload.get("email_verified")

        if not email or not email_verified:
            return Response({"detail": "Google no devolvió un correo verificado."}, status=status.HTTP_400_BAD_REQUEST)

        first_name = payload.get("given_name") or payload.get("name", "").split(" ")[0] or ""
        last_name = payload.get("family_name") or ""
        avatar_url = payload.get("picture")
        google_sub = payload.get("sub")

        if not first_name or not last_name:
            full_name = payload.get("name", "").strip().split(" ")
            if not first_name and full_name:
                first_name = full_name[0]
            if not last_name and len(full_name) > 1:
                last_name = " ".join(full_name[1:])

        user = CustomUser.objects.filter(email__iexact=email).first()

        with transaction.atomic():
            if user is None:
                user = CustomUser.objects.create_user(
                    email=email,
                    password=None,
                    first_name=first_name or "Usuario",
                    last_name=last_name or "Google",
                    avatar_url=avatar_url,
                    google_sub=google_sub,
                    auth_provider=CustomUser.AuthProvider.GOOGLE,
                )
            else:
                updates = []
                if not user.google_sub and google_sub:
                    user.google_sub = google_sub
                    updates.append("google_sub")
                if avatar_url and user.avatar_url != avatar_url:
                    user.avatar_url = avatar_url
                    updates.append("avatar_url")
                if user.auth_provider == CustomUser.AuthProvider.EMAIL:
                    user.auth_provider = CustomUser.AuthProvider.BOTH
                    updates.append("auth_provider")
                if not user.first_name and first_name:
                    user.first_name = first_name
                    updates.append("first_name")
                if not user.last_name and last_name:
                    user.last_name = last_name
                    updates.append("last_name")
                if updates:
                    user.save(update_fields=updates)

        tokens = build_tokens(user)
        return Response({**tokens, "user": UserSerializer(user).data}, status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


class RefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = TokenRefreshSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError:
            return Response({"detail": "Token inválido."}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            token = RefreshToken(serializer.validated_data["refresh"])
            token.blacklist()
        except TokenError:
            return Response({"detail": "Token inválido."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Sesión cerrada."}, status=status.HTTP_200_OK)
