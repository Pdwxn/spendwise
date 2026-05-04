from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import CustomUser
from finance.services import create_default_categories_for_user


@receiver(post_save, sender=CustomUser)
def create_categories_for_new_user(sender, instance, created, **kwargs):
    if created:
        create_default_categories_for_user(instance)
