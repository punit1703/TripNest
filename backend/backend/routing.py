from django.urls import re_path
from expenses.consumers import ExpenseConsumer

websocket_urlpatterns = [
    re_path(r'ws/trip/(?P<trip_id>\w+)/$', ExpenseConsumer.as_asgi()),
]
