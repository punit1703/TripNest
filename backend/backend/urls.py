"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'status': 'running',
        'message': 'Welcome to the TripNest API Backend!',
        'endpoints': {
            'register': request.build_absolute_uri('/register/'),
            'login': request.build_absolute_uri('/login/'),
            'profile': request.build_absolute_uri('/profile/'),
            'trips_list_user': request.build_absolute_uri('/trips/user/'),
            'trips_create': request.build_absolute_uri('/trips/create/'),
            'trips_join': request.build_absolute_uri('/trips/join/'),
            'token_obtain': reverse('token_obtain_pair', request=request, format=format),
            'token_refresh': reverse('token_refresh', request=request, format=format),
            'admin_panel': request.build_absolute_uri('/admin/'),
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('', include('users.urls')),
    path('trips/', include('trips.urls')),
    path('expenses/', include('expenses.urls')),
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

