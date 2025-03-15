# Generated by Django 5.1.3 on 2025-03-11 13:49

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0005_rename_friends_friend'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='friends',
            field=models.ManyToManyField(blank=True, related_name='friend_set', to=settings.AUTH_USER_MODEL),
        ),
        migrations.DeleteModel(
            name='Friend',
        ),
    ]
