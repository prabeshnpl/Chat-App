from django.urls import path
from .views import authentication,chat,logoutview
urlpatterns = [
    path('',chat,name='chat'),
    path('login/',authentication,name='login'),
    path('logout/',logoutview,name='logout'),
]