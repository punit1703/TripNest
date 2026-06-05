from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from trips.models import Trip, TripMember
from .models import Itinerary
from .serializers import GenerateItineraryRequestSerializer, ItinerarySerializer
from .services import OpenRouterService

class GenerateItineraryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = GenerateItineraryRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        trip_id = serializer.validated_data['trip_id']
        destination = serializer.validated_data['destination']
        days = serializer.validated_data['days']
        budget = serializer.validated_data['budget']
        
        trip = get_object_or_404(Trip, id=trip_id)
        
        if not TripMember.objects.filter(trip=trip, user=request.user).exists():
            return Response({"error": "You are not a member of this trip."}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            ai_response = OpenRouterService.generate_itinerary(destination, days, budget)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        Itinerary.objects.filter(trip=trip).delete()
        
        saved_itineraries = []
        for day_plan in ai_response.get('itinerary', []):
            itinerary = Itinerary(
                trip=trip,
                day_number=day_plan.get('day_number', 0),
                title=day_plan.get('title', 'Unknown Title'),
                description=day_plan.get('description', '')
            )
            saved_itineraries.append(itinerary)
            
        Itinerary.objects.bulk_create(saved_itineraries)
        
        response_data = {
            "estimated_budget": ai_response.get('estimated_budget', ''),
            "itinerary": ItinerarySerializer(saved_itineraries, many=True).data
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
