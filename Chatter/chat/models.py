from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class CustomUser(AbstractUser):
    # We can access friends of any user using user.friends.al(). Here related_name defines list of users who had added them as a friend.
    friends = models.ManyToManyField('self', symmetrical=False, related_name='friend_set', blank=True)

    def __str__(self):
        return self.username
    
class Message(models.Model):
    sender = models.ForeignKey(CustomUser,on_delete=models.CASCADE,related_name='sent_message')
    receiver = models.ForeignKey(CustomUser,on_delete=models.CASCADE,related_name='received_message')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"From {self.sender} to {self.receiver}: {self.message[:50]}"