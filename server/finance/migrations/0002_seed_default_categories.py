from django.db import migrations

from finance.constants import DEFAULT_CATEGORIES


def seed_default_categories(apps, schema_editor):
    Category = apps.get_model("finance", "Category")

    for category_data in DEFAULT_CATEGORIES:
        Category.objects.update_or_create(
            code=category_data["code"],
            defaults={
                "name": category_data["name"],
                "emoji": category_data["emoji"],
                "color": category_data["color"],
                "is_system": category_data["is_system"],
            },
        )


def unseed_default_categories(apps, schema_editor):
    Category = apps.get_model("finance", "Category")
    Category.objects.filter(code__in=[item["code"] for item in DEFAULT_CATEGORIES]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("finance", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_default_categories, unseed_default_categories),
    ]
