from rest_framework import serializers
from django.contrib.auth.models import User
from users.serializers import UserSerializer
from .models import Trip, TripMember, Expense, ItineraryDay

class TripMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TripMember
        fields = ('id', 'user', 'joined_at')

class TripSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Trip
        fields = (
            'id', 
            'name', 
            'origin',
            'destination', 
            'start_date', 
            'end_date', 
            'total_budget', 
            'invite_code', 
            'created_by', 
            'created_at'
        )
        read_only_fields = ('id', 'invite_code', 'created_by', 'created_at')

class ItineraryDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = ItineraryDay
        fields = ['id', 'day_number', 'activity_description']

class TripDetailSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    members = TripMemberSerializer(source='trip_members', many=True, read_only=True)
    itinerary_days = ItineraryDaySerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = (
            'id', 
            'name', 
            'origin',
            'destination', 
            'start_date', 
            'end_date', 
            'total_budget', 
            'invite_code', 
            'created_by', 
            'created_at', 
            'members',
            'itinerary_days'
        )


class ExpenseSerializer(serializers.ModelSerializer):
    # This magically grabs the username of whoever paid, so we can display their name!
    payer_username = serializers.ReadOnlyField(source='payer.username')

    class Meta:
        model = Expense
        fields = ['id', 'description', 'amount', 'payer', 'payer_username', 'date_logged']
        read_only_fields = ['payer'] # We will set the payer automatically so users can't forge it
