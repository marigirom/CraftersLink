# Generated migration for CraftersLink re-engineering
# Updates DESIGNER role to INTERIOR_DESIGNER

from django.db import migrations, models


def update_designer_role(apps, schema_editor):
    """Update all DESIGNER roles to INTERIOR_DESIGNER"""
    User = apps.get_model('users', 'User')
    User.objects.filter(role='DESIGNER').update(role='INTERIOR_DESIGNER')


def reverse_designer_role(apps, schema_editor):
    """Reverse migration: INTERIOR_DESIGNER back to DESIGNER"""
    User = apps.get_model('users', 'User')
    User.objects.filter(role='INTERIOR_DESIGNER').update(role='DESIGNER')


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_designerprofile'),
    ]

    operations = [
        # First, alter the field to allow both old and new values
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[
                    ('ARTISAN', 'Artisan'),
                    ('DESIGNER', 'Interior Designer'),  # Old value
                    ('INTERIOR_DESIGNER', 'Interior Designer'),  # New value
                ],
                default='INTERIOR_DESIGNER',
                max_length=20
            ),
        ),
        # Run the data migration
        migrations.RunPython(update_designer_role, reverse_designer_role),
        # Finally, set the field to only allow the new values
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[
                    ('ARTISAN', 'Artisan'),
                    ('INTERIOR_DESIGNER', 'Interior Designer'),
                ],
                default='INTERIOR_DESIGNER',
                max_length=20
            ),
        ),
    ]

# Made with Bob
