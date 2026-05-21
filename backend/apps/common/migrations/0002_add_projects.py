# Generated migration for CraftersLink re-engineering
# Adds Project and ProjectItem models

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0001_initial'),
        ('artisans', '0002_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('designer', models.ForeignKey(
                    limit_choices_to={'role': 'INTERIOR_DESIGNER'},
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='projects',
                    to=settings.AUTH_USER_MODEL
                )),
            ],
            options={
                'db_table': 'projects',
                'ordering': ['-updated_at'],
            },
        ),
        migrations.CreateModel(
            name='ProjectItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pinned_at', models.DateTimeField(auto_now_add=True)),
                ('notes', models.TextField(blank=True)),
                ('product', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='pinned_to_projects',
                    to='artisans.product'
                )),
                ('project', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='items',
                    to='common.project'
                )),
            ],
            options={
                'db_table': 'project_items',
                'ordering': ['-pinned_at'],
                'unique_together': {('project', 'product')},
            },
        ),
        migrations.AddIndex(
            model_name='project',
            index=models.Index(fields=['designer', '-updated_at'], name='projects_designer_updated_idx'),
        ),
        migrations.AddIndex(
            model_name='projectitem',
            index=models.Index(fields=['project', '-pinned_at'], name='project_items_project_pinned_idx'),
        ),
    ]

# Made with Bob
