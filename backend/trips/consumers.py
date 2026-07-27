import json
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import AccessToken
from .models import Trip, TripMember, ChatMessage

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.trip_id = self.scope['url_route']['kwargs']['trip_id']
        self.room_group_name = f'chat_{self.trip_id}'

        # Authenticate user via JWT query token
        query_string = self.scope.get('query_string', b'').decode('utf-8')
        query_params = parse_qs(query_string)
        token_list = query_params.get('token', [])
        
        self.user = None
        if token_list:
            token_str = token_list[0]
            self.user = await self.get_user_from_token(token_str)

        if not self.user or not self.user.is_authenticated:
            # Try getting user from scope if session authenticated
            scope_user = self.scope.get('user')
            if scope_user and scope_user.is_authenticated:
                self.user = scope_user

        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        # Check trip membership
        is_member = await self.check_trip_membership(self.trip_id, self.user)
        if not is_member:
            await self.close(code=4003)
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_text = data.get('message', '').strip()
            
            if not message_text:
                return

            # Save chat message to database
            msg = await self.save_chat_message(self.trip_id, self.user, message_text)

            # Broadcast message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'id': msg.id,
                    'trip_id': int(self.trip_id),
                    'sender_id': self.user.id,
                    'sender_username': self.user.username,
                    'message': msg.message,
                    'timestamp': msg.timestamp.isoformat()
                }
            )
        except Exception as e:
            print("ChatConsumer receive error:", e)

    async def chat_message(self, event):
        # Send message payload to WebSocket
        await self.send(text_data=json.dumps({
            'id': event['id'],
            'trip': event['trip_id'],
            'sender_id': event['sender_id'],
            'sender_username': event['sender_username'],
            'message': event['message'],
            'timestamp': event['timestamp']
        }))

    @database_sync_to_async
    def get_user_from_token(self, token_str):
        try:
            access_token = AccessToken(token_str)
            user_id = access_token.get('user_id')
            return User.objects.get(id=user_id)
        except Exception:
            return None

    @database_sync_to_async
    def check_trip_membership(self, trip_id, user):
        return TripMember.objects.filter(trip_id=trip_id, user=user).exists()

    @database_sync_to_async
    def save_chat_message(self, trip_id, user, message_text):
        trip = Trip.objects.get(id=trip_id)
        return ChatMessage.objects.create(trip=trip, sender=user, message=message_text)
