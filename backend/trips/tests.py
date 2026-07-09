from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Trip, TripMember

class TripTests(APITestCase):

    def setUp(self):
        # Create users
        self.user_creator = User.objects.create_user(
            username='creator',
            email='creator@example.com',
            password='password123'
        )
        self.user_member = User.objects.create_user(
            username='member',
            email='member@example.com',
            password='password123'
        )
        self.user_stranger = User.objects.create_user(
            username='stranger',
            email='stranger@example.com',
            password='password123'
        )

        # URL patterns
        self.create_url = reverse('trip-create')
        self.join_url = reverse('trip-join')
        self.user_trips_url = reverse('trip-user-list')

        # Sample trip data
        self.trip_data = {
            'name': 'Summer Vacation',
            'destination': 'Hawaii',
            'start_date': '2026-07-01',
            'end_date': '2026-07-10',
            'total_budget': '5000.00'
        }

    def test_create_trip_success(self):
        self.client.force_authenticate(user=self.user_creator)
        response = self.client.post(self.create_url, self.trip_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], self.trip_data['name'])
        self.assertEqual(response.data['destination'], self.trip_data['destination'])
        self.assertIsNotNone(response.data['invite_code'])
        self.assertTrue(response.data['invite_code'].startswith('TRP'))
        
        # Verify creator was automatically added as member
        trip_id = response.data['id']
        self.assertTrue(TripMember.objects.filter(trip_id=trip_id, user=self.user_creator).exists())

    def test_create_trip_unauthenticated(self):
        response = self.client.post(self.create_url, self.trip_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_join_trip_success(self):
        # Creator creates trip
        self.client.force_authenticate(user=self.user_creator)
        create_response = self.client.post(self.create_url, self.trip_data, format='json')
        invite_code = create_response.data['invite_code']
        trip_id = create_response.data['id']

        # Member joins trip
        self.client.force_authenticate(user=self.user_member)
        join_data = {'invite_code': invite_code}
        response = self.client.post(self.join_url, join_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], "Successfully joined the trip")
        self.assertTrue(TripMember.objects.filter(trip_id=trip_id, user=self.user_member).exists())

    def test_join_trip_already_member(self):
        # Creator creates trip
        self.client.force_authenticate(user=self.user_creator)
        create_response = self.client.post(self.create_url, self.trip_data, format='json')
        invite_code = create_response.data['invite_code']

        # Join once
        self.client.force_authenticate(user=self.user_member)
        join_data = {'invite_code': invite_code}
        self.client.post(self.join_url, join_data, format='json')

        # Try to join again
        response = self.client.post(self.join_url, join_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], "You are already a member of this trip")

    def test_join_trip_invalid_invite_code(self):
        self.client.force_authenticate(user=self.user_member)
        join_data = {'invite_code': 'TRPINVALID'}
        response = self.client.post(self.join_url, join_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], "Trip not found with this invite code")

    def test_get_trip_details_member(self):
        # Creator creates trip
        self.client.force_authenticate(user=self.user_creator)
        create_response = self.client.post(self.create_url, self.trip_data, format='json')
        trip_id = create_response.data['id']
        
        detail_url = reverse('trip-detail', kwargs={'pk': trip_id})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.trip_data['name'])

    def test_get_trip_details_non_member(self):
        # Creator creates trip
        self.client.force_authenticate(user=self.user_creator)
        create_response = self.client.post(self.create_url, self.trip_data, format='json')
        trip_id = create_response.data['id']
        
        # Stranger attempts to view details
        self.client.force_authenticate(user=self.user_stranger)
        detail_url = reverse('trip-detail', kwargs={'pk': trip_id})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], "You do not have permission to view this trip's details")

    def test_get_user_trips(self):
        # Creator creates trip
        self.client.force_authenticate(user=self.user_creator)
        self.client.post(self.create_url, self.trip_data, format='json')

        # Creator lists their trips
        response = self.client.get(self.user_trips_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_trips_base_endpoint_list_and_create(self):
        # Authenticate user
        self.client.force_authenticate(user=self.user_creator)
        
        # Test creating a trip via POST to /trips/
        base_url = '/trips/'
        response = self.client.post(base_url, self.trip_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], self.trip_data['name'])
        self.assertIn('budget', response.data)
        self.assertEqual(float(response.data['budget']), float(self.trip_data['total_budget']))
        
        # Test listing trips via GET to /trips/
        list_response = self.client.get(base_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]['name'], self.trip_data['name'])
        self.assertIn('budget', list_response.data[0])

