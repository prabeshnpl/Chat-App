from django.contrib import admin
from .models import CustomUser , Message, Group, GroupMessage, FriendShip

admin.site.register(CustomUser)
admin.site.register(Message)
admin.site.register(FriendShip)
admin.site.register(Group)
admin.site.register(GroupMessage)


