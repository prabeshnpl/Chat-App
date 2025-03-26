from django.urls import re_path
from .consumers import Chat, GroupChat

websocket_urlpatterns = [
    # Adjusted regex to allow numeric room IDs
    re_path(r'ws/chat/(?P<room_code>[a-zA-Z0-9\-]+)/$', Chat.as_asgi()),
    re_path(r'ws/groupchat/(?P<room_code>[a-zA-Z0-9\-]+)/$', GroupChat.as_asgi()),
]