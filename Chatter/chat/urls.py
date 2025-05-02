from django.urls import path
from .views import authentication,chat,logoutview,group_chat,upload_voice_message
urlpatterns = [
    path('',chat,name='chat'),
    path('group/',group_chat,name='group_chat'),
    path('login/',authentication,name='login'),
    path('logout/',logoutview,name='logout'),
    path('upload_voice_message/',upload_voice_message,name='upload_voice_message')
]