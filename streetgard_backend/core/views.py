from rest_framework import generics, permissions, filters
from .models import StreetGard, StreetGardData
from .serializers import StreetGardSerializer, StreetGardDataSerializer
from rest_framework.pagination import PageNumberPagination


class StreetGardListCreateView(generics.ListCreateAPIView):
    queryset = StreetGard.objects.all()
    serializer_class = StreetGardSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['created_time']
    
class StreetGardDataListCreateView(generics.ListCreateAPIView):
    queryset = StreetGardData.objects.all()
    serializer_class = StreetGardDataSerializer
    permission_classes = [permissions.AllowAny]
    
class StreetGardDataListSpecificDeviceView(generics.ListAPIView):
    serializer_class = StreetGardDataSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return StreetGardData.objects.filter(streetgard_id=self.kwargs['pk']).order_by('-created_time')[:200]
    
class StreetGardDataSpeciesLatestView(generics.ListAPIView):
    serializer_class = StreetGardDataSerializer
    permission_classes = [permissions.AllowAny]
    queryset = StreetGardData.objects.all()
    
    def get_queryset(self):
        return StreetGardData.objects.filter(streetgard_id=self.kwargs['pk']).order_by('-created_time')[:1]
