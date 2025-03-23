from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .models import CustomUser, Message, FriendShip
from channels.db import database_sync_to_async
import uuid
class Chat(AsyncWebsocketConsumer):
    async def connect(self):
        # Create a room using room_code saved in the database for every pair of users
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.room_name = f'room_{self.room_code}'

        # Add the user to the room group
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()
        await self.send(json.dumps({'type': 'connection', 'message': 'Successfully connected'}))

    async def disconnect(self, code):
        # Remove the user from the room group
        await self.channel_layer.group_discard(self.room_name, self.channel_name)
        await self.send(json.dumps({'type': 'connection', 'message': 'Successfully disconnected'}))

    async def receive(self, text_data=None, bytes_data=None):
        # Parse the incoming WebSocket message
        data = json.loads(text_data)
        message = data['message']
        user = self.scope['user']
        receiverId = data['receiverId']

        # Ensure the user is authenticated
        if user.is_authenticated:
            try:
                # Fetch the friendship and save the message using async-safe ORM calls
                friend = await self.get_friendship(receiverId)

                # Save the message
                await self.save_message(user, friend, message)

                # Broadcast the message to the room group
                await self.channel_layer.group_send(
                    self.room_name,
                    {
                        'type': 'send_chat',
                        'message': message,
                        'sender': user.username,
                    }
                )
            except FriendShip.DoesNotExist:
                await self.send(json.dumps({'error': 'Invalid room code'}))
        else:
            await self.send(json.dumps({'error': 'User not authenticated'}))

    async def send_chat(self, event):
        # Send the message to WebSocket clients
        message = event['message']
        sender = event['sender']
        await self.send(json.dumps({'type':'chat','message': message, 'sender': sender}))

    @database_sync_to_async
    def get_friendship(self,receiverId):

        return CustomUser.objects.get(id=receiverId)

    @database_sync_to_async
    def save_message(self, sender, receiver, message):
        # Save the message to the database
        return Message.objects.create(sender=sender, receiver=receiver, message=message)

