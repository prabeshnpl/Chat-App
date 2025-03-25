from django.urls import path
from .views import authentication,chat,logoutview,group_chat
urlpatterns = [
    path('',chat,name='chat'),
    path('group/',group_chat,name='group_chat'),
    path('login/',authentication,name='login'),
    path('logout/',logoutview,name='logout'),
]