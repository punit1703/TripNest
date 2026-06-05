from rest_framework import serializers
from .models import Itinerary

class ItinerarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Itinerary
        fields = ['id', 'trip', 'day_number', 'title', 'description']

class GenerateItineraryRequestSerializer(serializers.Serializer):
    trip_id = serializers.IntegerField(required=True)
    destination = serializers.CharField(max_length=255, required=True)
    days = serializers.IntegerField(min_value=1, max_value=30, required=True)
    budget = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
