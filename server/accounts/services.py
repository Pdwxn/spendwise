from .models import UserPreference


def create_default_preferences_for_user(user):
    UserPreference.objects.get_or_create(user=user)
