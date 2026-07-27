from rest_framework import serializers
from django.contrib.auth.models import User
from users.serializers import UserSerializer
from .models import Trip, TripMember, Expense, ItineraryDay, PackingItem, ChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source='sender.username')
    sender_id = serializers.ReadOnlyField(source='sender.id')

    class Meta:
        model = ChatMessage
        fields = ['id', 'trip', 'sender', 'sender_id', 'sender_username', 'message', 'timestamp']
        read_only_fields = ['id', 'trip', 'sender', 'timestamp']


class PackingItemSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.ReadOnlyField(source='assigned_to.username')
    created_by_username = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = PackingItem
        fields = ['id', 'item_name', 'category', 'assigned_to', 'assigned_to_username', 'is_packed', 'created_by', 'created_by_username', 'created_at']
        read_only_fields = ['created_by', 'created_at']

class TripMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TripMember
        fields = ('id', 'user', 'joined_at')

class TripSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    budget = serializers.DecimalField(source='total_budget', max_digits=10, decimal_places=2, read_only=True)

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
            'budget',
            'invite_code', 
            'created_by', 
            'created_at'
        )
        read_only_fields = ('id', 'invite_code', 'created_by', 'created_at')

class ItineraryDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = ItineraryDay
        fields = ['id', 'day_number', 'activity_description', 'location_name', 'latitude', 'longitude']

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
    recipient_username = serializers.ReadOnlyField(source='recipient.username')

    class Meta:
        model = Expense
        fields = ['id', 'description', 'amount', 'payer', 'payer_username', 'is_settlement', 'recipient', 'recipient_username', 'date_logged']
        read_only_fields = ['payer'] # We will set the payer automatically so users can't forge it

    def validate(self, attrs):
        is_settlement = attrs.get('is_settlement', False)
        recipient = attrs.get('recipient', None)
        payer = attrs.get('payer', self.context['request'].user if 'request' in self.context else None)

        if is_settlement:
            if not recipient:
                raise serializers.ValidationError("A recipient is required for settlements.")
            if payer and payer == recipient:
                raise serializers.ValidationError("You cannot settle up with yourself.")

            view = self.context.get('view')
            if view:
                trip_id = view.kwargs.get('trip_id')
                if trip_id:
                    if not TripMember.objects.filter(trip_id=trip_id, user=recipient).exists():
                        raise serializers.ValidationError("Recipient must be a member of the trip.")
                    if payer and not TripMember.objects.filter(trip_id=trip_id, user=payer).exists():
                        raise serializers.ValidationError("Payer must be a member of the trip.")
        return attrs
