from django.urls import path, include

urlpatterns = [
    # Provides the basic search portal
    path('', include('globus_portal_framework.urls')),
    path('', include('social_django.urls', namespace='social')),
]