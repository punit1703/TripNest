from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status

class AuthenticationTests(APITestCase):

    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.profile_url = reverse('profile')
        
        self.user_data = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'testpassword123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        # Pre-create a user for login and profile tests
        self.existing_user = User.objects.create_user(
            username='existinguser',
            email='existing@example.com',
            password='existingpassword123',
            first_name='Existing',
            last_name='User'
        )

    def test_register_user_success(self):
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertIn('tokens', response.data)
        self.assertEqual(response.data['user']['username'], self.user_data['username'])
        self.assertEqual(response.data['user']['email'], self.user_data['email'])
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])

    def test_register_user_duplicate_email(self):
        # Trying to register with an email that is already used
        duplicate_data = self.user_data.copy()
        duplicate_data['username'] = 'differentusername'
        duplicate_data['email'] = 'existing@example.com'
        
        response = self.client.post(self.register_url, duplicate_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_register_user_duplicate_username(self):
        # Trying to register with a username that is already used
        duplicate_data = self.user_data.copy()
        duplicate_data['username'] = 'existinguser'
        duplicate_data['email'] = 'different@example.com'
        
        response = self.client.post(self.register_url, duplicate_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)

    def test_login_user_success(self):
        login_data = {
            'username': 'existinguser',
            'password': 'existingpassword123'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertIn('tokens', response.data)
        self.assertEqual(response.data['user']['username'], 'existinguser')
        self.assertIn('access', response.data['tokens'])

    def test_login_user_invalid_credentials(self):
        login_data = {
            'username': 'existinguser',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

    def test_get_profile_unauthenticated(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_profile_authenticated(self):
        # Get token
        login_data = {
            'username': 'existinguser',
            'password': 'existingpassword123'
        }
        login_response = self.client.post(self.login_url, login_data, format='json')
        token = login_response.data['tokens']['access']
        
        # Include token in request headers
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.profile_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'existinguser')
        self.assertEqual(response.data['email'], 'existing@example.com')

