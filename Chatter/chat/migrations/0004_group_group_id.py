# Generated by Django 5.1.3 on 2025-03-29 08:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0003_group_groupmessage'),
    ]

    operations = [
        migrations.AddField(
            model_name='group',
            name='group_id',
            field=models.CharField(blank=True, default=None, max_length=6, null=True),
        ),
    ]
