from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    friends = models.ManyToManyField(
        'self',
        through="FriendShip",
        symmetrical=False,
        related_name='friend_set',
        blank=True
    )

    def __str__(self):
        return self.username

class FriendShip(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='friendship_user')
    friend = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='friendship_friend')
    room_code = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user}'s friend is {self.friend}"

    class Meta:
        unique_together = ('user', 'friend')

class Message(models.Model):
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_message')
    receiver = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='received_message')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"From {self.sender} to {self.receiver}: {self.message[:50]}"