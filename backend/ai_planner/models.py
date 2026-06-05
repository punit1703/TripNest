from django.db import models
from trips.models import Trip

class Itinerary(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='itineraries')
    day_number = models.IntegerField()
    title = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return f"Day {self.day_number}: {self.title} for {self.trip.name}"
