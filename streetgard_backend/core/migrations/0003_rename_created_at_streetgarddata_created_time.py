# Generated by Django 5.1.7 on 2025-03-12 06:24

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_rename_created_time_streetgarddata_created_at'),
    ]

    operations = [
        migrations.RenameField(
            model_name='streetgarddata',
            old_name='created_at',
            new_name='created_time',
        ),
    ]
