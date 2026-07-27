from django.urls import path
from .views import CreateTripView, JoinTripView, TripDetailView, GetUserTripsView, TripAnalyticsView, ExpenseListCreate, generate_itinerary, TripListCreate, PackingItemListCreateView, PackingItemDetailView
from expenses.views import TripSettlementView

urlpatterns = [
    path('', TripListCreate.as_view(), name='trip-list-create'),
    path('create/', CreateTripView.as_view(), name='trip-create'),
    path('join/', JoinTripView.as_view(), name='trip-join'),
    path('user/', GetUserTripsView.as_view(), name='trip-user-list'),
    path('<int:pk>/', TripDetailView.as_view(), name='trip-detail'),
    path('<int:trip_id>/settlements/', TripSettlementView.as_view(), name='trip-settlements'),
    path('<int:trip_id>/analytics/', TripAnalyticsView.as_view(), name='trip-analytics'),
    path('<int:trip_id>/expenses/', ExpenseListCreate.as_view(), name='trip-expenses'),
    path('<int:trip_id>/generate-itinerary/', generate_itinerary, name='generate-itinerary'),
    path('<int:trip_id>/packing/', PackingItemListCreateView.as_view(), name='trip-packing-list'),
    path('<int:trip_id>/packing/<int:pk>/', PackingItemDetailView.as_view(), name='trip-packing-detail'),
]
