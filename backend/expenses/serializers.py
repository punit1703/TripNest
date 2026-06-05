from rest_framework import serializers
from .models import Expense, ExpenseSplit
from django.contrib.auth.models import User
from trips.models import TripMember

class ExpenseSplitSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user'
    )
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ExpenseSplit
        fields = ['id', 'user_id', 'username', 'amount']

class ExpenseSerializer(serializers.ModelSerializer):
    splits = ExpenseSplitSerializer(many=True)
    paid_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='paid_by', required=False
    )
    paid_by_username = serializers.CharField(source='paid_by.username', read_only=True)

    class Meta:
        model = Expense
        fields = ['id', 'trip', 'amount', 'paid_by_id', 'paid_by_username', 'category', 'note', 'created_at', 'splits']
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        amount = data.get('amount')
        splits = data.get('splits')
        
        if splits is not None:
            total_split = sum(split['amount'] for split in splits)
            if total_split != amount:
                raise serializers.ValidationError("Sum of splits must equal the total expense amount.")
                
        trip = data.get('trip')
        paid_by = data.get('paid_by', self.context['request'].user)
        
        if not TripMember.objects.filter(trip=trip, user=paid_by).exists():
            raise serializers.ValidationError({"paid_by": "Payer must be a member of the trip."})
            
        if splits is not None:
            for split in splits:
                if not TripMember.objects.filter(trip=trip, user=split['user']).exists():
                    raise serializers.ValidationError({"splits": f"User {split['user'].username} is not a member of the trip."})

        return data

    def create(self, validated_data):
        splits_data = validated_data.pop('splits')
        if 'paid_by' not in validated_data:
            validated_data['paid_by'] = self.context['request'].user
            
        expense = Expense.objects.create(**validated_data)
        
        for split_data in splits_data:
            ExpenseSplit.objects.create(expense=expense, **split_data)
            
        return expense
