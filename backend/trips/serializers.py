from rest_framework import serializers
from django.contrib.auth.models import User
from users.serializers import UserSerializer
from .models import Trip, TripMember

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

class TripDetailSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    members = TripMemberSerializer(source='trip_members', many=True, read_only=True)

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
            'members'
        )
