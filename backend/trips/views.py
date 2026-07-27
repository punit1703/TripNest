import os
import json
import google.generativeai as genai
from django.shortcuts import get_object_or_404
from rest_framework import generics, status, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView

from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Trip, TripMember, Expense, ItineraryDay, PackingItem, ChatMessage
from .serializers import TripSerializer, TripDetailSerializer, ExpenseSerializer, PackingItemSerializer, ChatMessageSerializer


# Configure your AI Key (Paste your actual key inside the quotes!)
genai.configure(api_key="YOUR_COPIED_API_KEY_HERE")

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

class TripListCreate(generics.ListCreateAPIView):
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return trips where the current user is in the 'members' list
        return Trip.objects.filter(trip_members__user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        trip = serializer.save(created_by=self.request.user)
        TripMember.objects.get_or_create(trip=trip, user=self.request.user)

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


def load_env_from_file():
    from django.conf import settings
    paths_to_check = []
    try:
        paths_to_check.append(os.path.join(settings.BASE_DIR, '.env'))
        paths_to_check.append(os.path.join(settings.BASE_DIR.parent, '.env'))
    except Exception:
        pass
    
    this_dir = os.path.dirname(os.path.abspath(__file__))
    paths_to_check.append(os.path.join(this_dir, '.env'))
    paths_to_check.append(os.path.join(os.path.dirname(this_dir), '.env'))
    paths_to_check.append(os.path.join(os.path.dirname(os.path.dirname(this_dir)), '.env'))
    
    for path in paths_to_check:
        if os.path.exists(path):
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#'):
                            key_val = line.split('=', 1)
                            if len(key_val) == 2:
                                k, v = key_val[0].strip(), key_val[1].strip()
                                if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
                                    v = v[1:-1]
                                os.environ[k] = v
                break
            except Exception:
                pass

load_env_from_file()

# Configure your AI Key (looks for environment variable GEMINI_API_KEY, else defaults to placeholder)
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "YOUR_COPIED_API_KEY_HERE")) 

def generate_mock_itinerary(trip):
    days = (trip.end_date - trip.start_date).days + 1
    if days <= 0:
        days = 1
    
    dest = trip.destination
    budget = float(trip.total_budget)
    
    if dest.lower() == 'spiti':
        activities_pool = [
            ("Arrive in Kaza, acclimatize to the high altitude, and rest.", "Kaza", 32.2252, 78.0710),
            ("Visit Key Monastery and the high-altitude village of Kibber.", "Key Monastery", 32.2990, 78.0125),
            ("Explore the fossil village of Langza and send a postcard from Hikkim.", "Hikkim", 32.2400, 78.0800),
            ("Drive to Pin Valley, visit Kungri Monastery, and enjoy local homestay hospitality.", "Pin Valley", 32.0500, 78.0500),
            ("Travel to Dhankar Monastery, perched cliffside, and hike to Dhankar Lake.", "Dhankar Monastery", 32.1333, 78.1333),
            ("Enjoy a premium camping experience at the pristine Chandratal Lake.", "Chandratal Lake", 32.4700, 77.6167),
            ("Depart Kaza and travel back via Kunzum Pass and Rohtang Pass.", "Kunzum Pass", 32.3962, 77.6366)
        ]
    elif dest.lower() == 'kyoto':
        activities_pool = [
            ("Arrive in Kyoto, check into your traditional Ryokan, and stroll around Gion.", "Gion, Kyoto", 35.0037, 135.7772),
            ("Visit the iconic Fushimi Inari Shrine with its thousands of red torii gates.", "Fushimi Inari Shrine", 34.9671, 135.7727),
            ("Explore Kinkaku-ji (Golden Pavilion) and walk through Arashiyama Bamboo Grove.", "Kinkaku-ji", 35.0394, 135.7292),
            ("Participate in a traditional tea ceremony and explore Kiyomizu-dera temple.", "Kiyomizu-dera", 34.9949, 135.7850),
            ("Take a day trip to Nara to see the giant Buddha at Todai-ji.", "Todai-ji, Nara", 34.6851, 135.8048),
            ("Explore Nishiki Market to taste local street food and buy souvenirs.", "Nishiki Market", 35.0050, 135.7649),
            ("Relax at a Zen rock garden and enjoy a fine multi-course kaiseki dinner.", "Kyoto Central", 35.0116, 135.7681)
        ]
    else:
        # Generic fallback coordinates offset around a default location
        base_lat, base_lng = 28.6139, 77.2090  # Default Delhi / general central location
        activities_pool = [
            (f"Welcome to {dest}! Arrive, check in, and relax after your journey.", f"{dest} Center", base_lat, base_lng),
            (f"Take a guided city tour to explore the major landmarks of {dest}.", f"{dest} Landmarks", base_lat + 0.02, base_lng + 0.01),
            (f"Enjoy a food tasting tour around the local markets of {dest}.", f"{dest} Market", base_lat - 0.01, base_lng + 0.02),
            (f"Go on an outdoor adventure or nature trail excursion in {dest}.", f"{dest} Park", base_lat + 0.03, base_lng - 0.02),
            (f"Visit a famous museum or cultural heritage site in {dest}.", f"{dest} Museum", base_lat - 0.02, base_lng - 0.01),
            (f"Indulge in a shopping spree at the popular districts of {dest}.", f"{dest} Plaza", base_lat + 0.01, base_lng + 0.03),
            (f"Relax at a local cafe and watch the sunset on your final evening in {dest}.", f"{dest} Viewpoint", base_lat - 0.03, base_lng + 0.01)
        ]
    
    itinerary = []
    for day in range(1, days + 1):
        idx = (day - 1) % len(activities_pool)
        activity_text, loc_name, lat, lng = activities_pool[idx]
        
        if budget >= 15000:
            activity_text += " [Premium/Luxury Experience]"
        else:
            activity_text += " [Budget-Friendly Option]"
            
        itinerary.append({
            "day_number": day,
            "activity_description": activity_text,
            "location_name": loc_name,
            "latitude": lat,
            "longitude": lng
        })
    return itinerary

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_itinerary(request, trip_id):
    try:
        trip = Trip.objects.get(id=trip_id)
        
        # 1. Clear any old schedule if they are generating a new one
        trip.itinerary_days.all().delete()

        # 2. Write the Prompt for the AI
        prompt = f"""
        You are an expert travel planner. Create a day-by-day itinerary for a trip to {trip.destination}.
        The total budget for the trip is ${trip.total_budget}.
        The trip dates are from {trip.start_date} to {trip.end_date}. 
        
        Respond ONLY with a valid, raw JSON array of objects. Do not include markdown formatting like ```json.
        Each object must have exactly five keys:
        - "day_number" (an integer)
        - "activity_description" (a string detailing the plan)
        - "location_name" (a string naming the main landmark/location for this day)
        - "latitude" (a float representing latitude of the location, e.g. 35.0116)
        - "longitude" (a float representing longitude of the location, e.g. 135.7681)
        """

        # 3. Call the Gemini AI
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        # 4. Parse the AI's response into Python data
        ai_text = response.text.strip()
        if ai_text.startswith('```json'): # Strip markdown if the AI accidentally adds it
            ai_text = ai_text[7:-3]
            
        schedule_data = json.loads(ai_text)

        # 5. Save the AI's thoughts permanently into your Database!
        formatted_for_react = []
        for day in schedule_data:
            # Save to SQLite
            new_day = ItineraryDay.objects.create(
                trip=trip,
                day_number=day['day_number'],
                activity_description=day['activity_description'],
                location_name=day.get('location_name', f"Day {day['day_number']} Stop"),
                latitude=day.get('latitude'),
                longitude=day.get('longitude')
            )
            # Format exactly how React expects it
            formatted_for_react.append({
                "day": new_day.day_number,
                "activity": new_day.activity_description,
                "location_name": new_day.location_name,
                "latitude": new_day.latitude,
                "longitude": new_day.longitude
            })

        # Send it back to the frontend!
        return Response({"itinerary": formatted_for_react})

    except Exception as e:
        print("AI Error, falling back to mock itinerary generator:", e)
        try:
            schedule_data = generate_mock_itinerary(trip)
            formatted_for_react = []
            for day in schedule_data:
                new_day = ItineraryDay.objects.create(
                    trip=trip,
                    day_number=day['day_number'],
                    activity_description=day['activity_description'],
                    location_name=day.get('location_name', f"Day {day['day_number']} Stop"),
                    latitude=day.get('latitude'),
                    longitude=day.get('longitude')
                )
                formatted_for_react.append({
                    "day": new_day.day_number,
                    "activity": new_day.activity_description,
                    "location_name": new_day.location_name,
                    "latitude": new_day.latitude,
                    "longitude": new_day.longitude
                })
            return Response({"itinerary": formatted_for_react})
        except Exception as mock_e:
            return Response({"error": f"AI Generation failed and fallback also failed: {str(mock_e)}"}, status=500)


class PackingItemListCreateView(generics.ListCreateAPIView):
    serializer_class = PackingItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        trip_id = self.kwargs['trip_id']
        return PackingItem.objects.filter(trip_id=trip_id)

    def perform_create(self, serializer):
        trip = get_object_or_404(Trip, id=self.kwargs['trip_id'])
        if not TripMember.objects.filter(trip=trip, user=self.request.user).exists():
            raise permissions.PermissionDenied("You must be a member of this trip to add packing items.")
        serializer.save(created_by=self.request.user, trip=trip)


class PackingItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PackingItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = PackingItem.objects.all()

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if not TripMember.objects.filter(trip=obj.trip, user=request.user).exists():
            self.permission_denied(request, message="You are not a member of this trip.")


class ChatMessageListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        trip_id = self.kwargs['trip_id']
        trip = get_object_or_404(Trip, id=trip_id)
        if not TripMember.objects.filter(trip=trip, user=self.request.user).exists():
            raise PermissionDenied("You are not a member of this trip.")
        return ChatMessage.objects.filter(trip_id=trip_id).order_by('timestamp')

    def perform_create(self, serializer):
        trip = get_object_or_404(Trip, id=self.kwargs['trip_id'])
        if not TripMember.objects.filter(trip=trip, user=self.request.user).exists():
            raise PermissionDenied("You are not a member of this trip.")
        serializer.save(sender=self.request.user, trip=trip)






