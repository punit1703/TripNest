from django.urls import re_path
from expenses.consumers import ExpenseConsumer
from trips.consumers import ChatConsumer

websocket_urlpatterns = [
    re_path(r'ws/trip/(?P<trip_id>\w+)/$', ExpenseConsumer.as_asgi()),
    re_path(r'ws/chat/(?P<trip_id>\w+)/$', ChatConsumer.as_asgi()),
]

