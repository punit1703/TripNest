import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ExpenseConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.trip_id = self.scope['url_route']['kwargs']['trip_id']
        self.room_group_name = f'trip_{self.trip_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from room group
    async def expense_update(self, event):
        message = event['message']
        action = event.get('action', 'update')
        
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'action': action,
            'message': message
        }))
