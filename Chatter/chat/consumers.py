from channels.generic.websocket import AsyncWebsocketConsumer
import json, base64
from .models import CustomUser, Message, FriendShip, GroupMessage, Group
from channels.db import database_sync_to_async


class Chat(AsyncWebsocketConsumer):
    async def connect(self):
        # Create a room using room_code saved in the database for every pair of users
        # This code is fetched through url from routing.py
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.room_name = f'room_{self.room_code}'

        # Add the user to the room group
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()
        await self.send(json.dumps({'type': 'connection', 'message': 'connected'}))

    async def disconnect(self, code):
        # Remove the user from the room group
        await self.channel_layer.group_discard(self.room_name, self.channel_name)
        await self.send(json.dumps({'type': 'connection', 'message': 'disconnected'}))
        

    async def receive(self, text_data=None, bytes_data=None):
        # Parse the incoming WebSocket message
        data = json.loads(text_data)
        message = data['message']
        user = self.scope['user']
        receiverId = data['receiverId']
        vmessage = data['vmessage']

        # Ensure the user is authenticated
        if user.is_authenticated:
            try:
                # Fetch the friendship and save the message using async-safe ORM calls
                friend = await self.get_friendship(receiverId)

                if message:
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

                if vmessage:
                    audio_data = base64.b64decode(vmessage)
                    import uuid
                    file_name = f"vmessage_{uuid.uuid4().hex}.webm"

                    from django.core.files.base import ContentFile
                    voice_message_file = ContentFile(audio_data, name=file_name)

                    await self.save_vmessage(user, friend, voice_message_file)
                   
                    audio_url = f"/media/voice_messages/{file_name}"

                    await self.channel_layer.group_send(
                        self.room_name,
                        {
                            "type": "send_vmessage",
                            "vmessage": audio_url,
                            "sender": user.username,
                        },
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
    
    async def send_vmessage(self, event):
        # Send the message to WebSocket clients
        vmessage = event['vmessage']
        sender = event['sender']
        await self.send(json.dumps({'type':'vmessage','vmessage': vmessage, 'sender': sender}))

    async def user_joined(self, event):
        # Notify all users in the group about the new user
        message = event['message']
        await self.send(json.dumps({'type': 'user_joined', 'message': message}))

    @database_sync_to_async
    def get_friendship(self,receiverId):
        return CustomUser.objects.get(id=receiverId)

    @database_sync_to_async
    def save_message(self, sender, receiver, message):
        # Save the message to the database
        return Message.objects.create(sender=sender, receiver=receiver, message=message)
    
    @database_sync_to_async
    def save_vmessage(self, sender, receiver, vmessage):
        # Save the message to the database
        return Message.objects.create(sender=sender, receiver=receiver, voice_message=vmessage)

class GroupChat(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.room_name = f'room_{self.room_code}'

        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()
        await self.send(json.dumps({"type":'connection','message':'connected'}))

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.room_name,self.channel_name)
        await self.send(json.dumps({'type': 'connection', 'message': 'disconnected'}))

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        sender = self.scope['user']
        message = data['message']
        groupId = data['receiverId']

        if sender.is_authenticated:
            try:
                
                # Save the message
                await self.save_message(groupId, sender, message)

                # Broadcast the message to the room group
                await self.channel_layer.group_send(
                    self.room_name,
                    {
                        'type': 'send_chat',
                        'message': message,
                        'sender_username': sender.username,
                        'sender_first_name': sender.first_name,
                        'sender_last_name': sender.last_name,
                    }
                )
            except FriendShip.DoesNotExist:
                await self.send(json.dumps({'error': 'Invalid room code'}))
        else:
            await self.send(json.dumps({'error': 'User not authenticated'}))

    async def send_chat(self, event):
        # Send the message to WebSocket clients
        message = event['message']
        sender_username = event['sender_username']
        sender_first_name = event['sender_first_name']
        sender_last_name = event['sender_last_name']
        await self.send(json.dumps({'type':'groupchat','message': message,'username':sender_username ,'sender_first_name': sender_first_name, 'sender_last_name':sender_last_name}))
    
    async def user_joined(self, event):
        # Notify all users in the group about the new user
        message = event['message']
        await self.send(json.dumps({'type': 'user_joined', 'message': message}))

    @database_sync_to_async
    def save_message(self, groupId, sender, message):
        # Save the message to the database
        return GroupMessage.objects.create(sender=sender, group=Group.objects.get(id=groupId), message=message)

    @database_sync_to_async
    def save_vmessage(self, sender, receiver, vmessage):
        # Save the message to the database
        return Message.objects.create(sender=sender, receiver=receiver, voice_message=vmessage)