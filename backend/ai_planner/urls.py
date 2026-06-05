from django.urls import path
from .views import GenerateItineraryView

urlpatterns = [
    path('generate-itinerary/', GenerateItineraryView.as_view(), name='generate-itinerary'),
]
