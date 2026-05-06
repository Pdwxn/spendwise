import uuid

from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models


class CustomUserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("El correo electrónico es obligatorio.")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("El superusuario debe tener is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("El superusuario debe tener is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    class AuthProvider(models.TextChoices):
        EMAIL = "email", "Email"
        GOOGLE = "google", "Google"
        BOTH = "both", "Both"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    google_sub = models.CharField(max_length=255, unique=True, null=True, blank=True)
    avatar_url = models.URLField(null=True, blank=True)
    auth_provider = models.CharField(max_length=20, choices=AuthProvider.choices, default=AuthProvider.EMAIL)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.email


class UserPreference(models.Model):
    class Currency(models.TextChoices):
        CLP = "CLP", "CLP"
        COP = "COP", "COP"
        USD = "USD", "USD"
        EUR = "EUR", "EUR"

    class Theme(models.TextChoices):
        DARK = "dark", "Dark"
        LIGHT = "light", "Light"

    class Language(models.TextChoices):
        ES = "es", "Español"
        EN = "en", "English"

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="preferences")
    currency = models.CharField(max_length=3, choices=Currency.choices, default=Currency.USD)
    theme = models.CharField(max_length=10, choices=Theme.choices, default=Theme.DARK)
    language = models.CharField(max_length=5, choices=Language.choices, default=Language.ES)

    class Meta:
        ordering = ["user__created_at"]

    def __str__(self) -> str:
        return f"Preferences for {self.user.email}"
