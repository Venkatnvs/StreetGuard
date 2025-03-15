from django.urls import path
from .views import StreetGardListCreateView, StreetGardDataListCreateView, StreetGardDataSpeciesLatestView, StreetGardDataListSpecificDeviceView

urlpatterns = [
    path('streetgard/', StreetGardListCreateView.as_view(), name='streetgard-list-create'),
    path('streetgard-data/', StreetGardDataListCreateView.as_view(), name='streetgard-data-list-create'),
    path('streetgard-data/<int:pk>/species-latest/', StreetGardDataSpeciesLatestView.as_view(), name='streetgard-data-species-latest'),
    path('streetgard-data/<int:pk>/', StreetGardDataListSpecificDeviceView.as_view(), name='streetgard-data-list-specific-device'),
]