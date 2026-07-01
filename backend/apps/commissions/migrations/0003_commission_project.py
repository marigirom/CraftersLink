"""
Migration: add nullable project_id FK to commissions table.

Rationale: Every new commission should optionally belong to a designer's Project.
Nullable because existing commissions pre-date this feature and must not be broken.
on_delete=SET_NULL: deleting a Project detaches its commissions rather than
removing them — commission history is preserved.
"""
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('commissions', '0002_initial'),
        ('common', '0003_rename_projects_designer_updated_idx_projects_designe_461a08_idx_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='commission',
            name='project',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='commissions',
                to='common.project',
            ),
        ),
    ]

# Made with Bob
