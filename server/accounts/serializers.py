from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import CustomUser


def build_tokens(user):
    from rest_framework_simplejwt.tokens import RefreshToken

    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class UserSerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(source="first_name")
    lastName = serializers.CharField(source="last_name")
    avatarUrl = serializers.URLField(source="avatar_url", allow_null=True, allow_blank=True, required=False)
    authProvider = serializers.CharField(source="auth_provider")

    class Meta:
        model = CustomUser
        fields = ["id", "firstName", "lastName", "email", "avatarUrl", "authProvider"]


class RegisterSerializer(serializers.Serializer):
    firstName = serializers.CharField(max_length=150)
    lastName = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages)) from exc

        return value

    def validate_email(self, value):
        if CustomUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con este correo.")

        return value

    def create(self, validated_data):
        return CustomUser.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data["firstName"],
            last_name=validated_data["lastName"],
            auth_provider=CustomUser.AuthProvider.EMAIL,
        )


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get("request"),
            email=attrs["email"],
            password=attrs["password"],
        )

        if user is None:
            raise serializers.ValidationError({"detail": "Credenciales inválidas."})

        attrs["user"] = user
        return attrs


class GoogleAuthSerializer(serializers.Serializer):
    idToken = serializers.CharField()


class AuthResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()
