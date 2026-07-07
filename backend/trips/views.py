from django.shortcuts import get_object_or_404
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Trip, TripMember, Expense
from .serializers import TripSerializer, TripDetailSerializer, ExpenseSerializer

class CreateTripView(generics.CreateAPIView):
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Save the trip setting the creator
        trip = serializer.save(created_by=self.request.user)
        # Automatically add the creator as a member
        TripMember.objects.create(trip=trip, user=self.request.user)

class JoinTripView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        invite_code = request.data.get('invite_code')
        if not invite_code:
            return Response(
                {"error": "Please provide an invite_code"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            trip = Trip.objects.get(invite_code=invite_code)
        except Trip.DoesNotExist:
            return Response(
                {"error": "Trip not found with this invite code"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if the user is already a member
        if TripMember.objects.filter(trip=trip, user=request.user).exists():
            return Response(
                {"error": "You are already a member of this trip"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add the user to the trip members
        TripMember.objects.create(trip=trip, user=request.user)
        
        # Return success with trip details
        serializer = TripDetailSerializer(trip)
        return Response(
            {
                "message": "Successfully joined the trip",
                "trip": serializer.data
            },
            status=status.HTTP_201_CREATED
        )

class TripDetailView(generics.RetrieveAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Enforce that only trip members can view the details
        if not TripMember.objects.filter(trip=instance, user=request.user).exists():
            return Response(
                {"error": "You do not have permission to view this trip's details"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class GetUserTripsView(generics.ListAPIView):
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return all trips where the user is a member
        return Trip.objects.filter(trip_members__user=self.request.user).order_by('-created_at')

from django.db.models import Sum

class TripAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, trip_id):
        try:
            trip = Trip.objects.get(id=trip_id)
        except Trip.DoesNotExist:
            return Response({"error": "Trip not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if not TripMember.objects.filter(trip=trip, user=request.user).exists():
            return Response({"error": "You do not have permission to view this trip's analytics"}, status=status.HTTP_403_FORBIDDEN)
            
        # Budget Overview
        total_budget = trip.total_budget
        from expenses.models import Expense
        spent = Expense.objects.filter(trip=trip).aggregate(total=Sum('amount'))['total'] or 0
        remaining = total_budget - spent
        
        # Expense Categories
        categories_agg = Expense.objects.filter(trip=trip).values('category').annotate(total=Sum('amount'))
        categories = {item['category']: item['total'] for item in categories_agg}
        
        # Default categories based on models.py
        for cat in ['Food', 'Transport', 'Accommodation', 'Activities', 'Other']:
            if cat not in categories:
                categories[cat] = 0
                
        # Trip Statistics
        total_members = trip.trip_members.count()
        total_expenses = Expense.objects.filter(trip=trip).count()
        duration_days = (trip.end_date - trip.start_date).days + 1
        
        return Response({
            "budget_overview": {
                "budget": total_budget,
                "spent": spent,
                "remaining": remaining
            },
            "expense_categories": categories,
            "trip_statistics": {
                "total_members": total_members,
                "total_expenses": total_expenses,
                "trip_duration_days": duration_days
            }
        })


class ExpenseListCreate(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # When React asks for expenses, ONLY return the ones for this specific trip
        return Expense.objects.filter(trip_id=self.kwargs['trip_id'])

    def perform_create(self, serializer):
        # When React saves a new expense, automatically link it to the current user and trip!
        trip = Trip.objects.get(id=self.kwargs['trip_id'])
        serializer.save(payer=self.request.user, trip=trip)


