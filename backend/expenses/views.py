from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Expense
from .serializers import ExpenseSerializer
from trips.models import Trip, TripMember
from django.shortcuts import get_object_or_404
from collections import defaultdict
from decimal import Decimal

class AddExpenseView(generics.CreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(paid_by=self.request.user)

class TripExpensesView(generics.ListAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        trip_id = self.kwargs['trip_id']
        trip = get_object_or_404(Trip, id=trip_id)
        if not TripMember.objects.filter(trip=trip, user=self.request.user).exists():
            return Expense.objects.none()
        return Expense.objects.filter(trip=trip).order_by('-created_at')

class ExpenseDetailView(generics.DestroyAPIView):
    queryset = Expense.objects.all()
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        expense = self.get_object()
        if expense.paid_by != request.user and expense.trip.created_by != request.user:
            return Response({"error": "You do not have permission to delete this expense."}, status=status.HTTP_403_FORBIDDEN)
        return self.destroy(request, *args, **kwargs)

class TripSettlementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, trip_id):
        trip = get_object_or_404(Trip, id=trip_id)
        
        if not TripMember.objects.filter(trip=trip, user=request.user).exists():
            return Response({"error": "You are not a member of this trip."}, status=status.HTTP_403_FORBIDDEN)
            
        expenses = Expense.objects.filter(trip=trip)
        
        balances = defaultdict(Decimal)
        users_info = {}
        
        for expense in expenses:
            users_info[expense.paid_by.id] = expense.paid_by.username
            balances[expense.paid_by.id] += expense.amount
            
            for split in expense.splits.all():
                users_info[split.user.id] = split.user.username
                balances[split.user.id] -= split.amount
                
        debtors = []
        creditors = []
        
        for user_id, balance in balances.items():
            if balance < Decimal('0.00'):
                debtors.append({'user_id': user_id, 'username': users_info[user_id], 'amount': abs(balance)})
            elif balance > Decimal('0.00'):
                creditors.append({'user_id': user_id, 'username': users_info[user_id], 'amount': balance})
                
        debtors.sort(key=lambda x: x['amount'], reverse=True)
        creditors.sort(key=lambda x: x['amount'], reverse=True)
        
        settlements = []
        
        i, j = 0, 0
        while i < len(debtors) and j < len(creditors):
            debtor = debtors[i]
            creditor = creditors[j]
            
            settled_amount = min(debtor['amount'], creditor['amount'])
            
            settlements.append({
                "from_user": debtor['username'],
                "from_user_id": debtor['user_id'],
                "to_user": creditor['username'],
                "to_user_id": creditor['user_id'],
                "amount": f"{settled_amount:.2f}"
            })
            
            debtor['amount'] -= settled_amount
            creditor['amount'] -= settled_amount
            
            if debtor['amount'] == Decimal('0.00'):
                i += 1
            if creditor['amount'] == Decimal('0.00'):
                j += 1
                
        return Response({
            "trip_id": trip.id,
            "trip_name": trip.name,
            "settlements": settlements
        })
