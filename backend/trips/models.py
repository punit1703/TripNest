import random
import string
from django.db import models
from django.contrib.auth.models import User

def generate_unique_invite_code():
    while True:
        code = 'TRP' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        if not Trip.objects.filter(invite_code=code).exists():
            return code

class Trip(models.Model):
    name = models.CharField(max_length=255)
    origin = models.CharField(max_length=255, default='Unknown')
    destination = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    total_budget = models.DecimalField(max_digits=10, decimal_places=2)
    invite_code = models.CharField(max_length=10, unique=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_trips')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.invite_code:
            self.invite_code = generate_unique_invite_code()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} to {self.destination}"

class TripMember(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='trip_members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trip_memberships')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('trip', 'user')

    def __str__(self):
        return f"{self.user.username} in {self.trip.name}"


class Expense(models.Model):
    # Links this expense to a specific trip
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='trips_expenses')
    
    # Records exactly WHO paid for it
    payer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trips_paid_expenses')
    
    # The details from your React form
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Automatically logs the exact date and time
    date_logged = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.payer.username} paid ${self.amount} for {self.description}"


class ItineraryDay(models.Model):
    # Links this specific day to the overall trip
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='itinerary_days')
    
    # Keeps track of Day 1, Day 2, etc.
    day_number = models.IntegerField()
    
    # The actual AI-generated plan
    activity_description = models.TextField()

    class Meta:
        # This ensures the database always hands the days back in the correct 1, 2, 3 order!
        ordering = ['day_number'] 

    def __str__(self):
        return f"Day {self.day_number} in {self.trip.destination}"

