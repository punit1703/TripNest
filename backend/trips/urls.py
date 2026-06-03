from django.urls import path
from .views import CreateTripView, JoinTripView, TripDetailView, GetUserTripsView

urlpatterns = [
    path('create/', CreateTripView.as_view(), name='trip-create'),
    path('join/', JoinTripView.as_view(), name='trip-join'),
    path('user/', GetUserTripsView.as_view(), name='trip-user-list'),
    path('<int:pk>/', TripDetailView.as_view(), name='trip-detail'),
]
