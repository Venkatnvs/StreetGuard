from rest_framework import serializers
from .models import StreetGard, StreetGardData

class StreetGardSerializer(serializers.ModelSerializer):
    latest_bulb_status = serializers.SerializerMethodField()
    latest_latitude = serializers.SerializerMethodField()
    latest_longitude = serializers.SerializerMethodField()
    latest_updated_time = serializers.SerializerMethodField()
    
    class Meta:
        model = StreetGard
        fields = '__all__'
        
    def get_latest_bulb_status(self, obj):
        latest_data = StreetGardData.objects.filter(streetgard=obj).order_by('-created_time').first()
        return latest_data.bulb_state if latest_data else None
    
    def get_latest_latitude(self, obj):
        latest_data = StreetGardData.objects.filter(streetgard=obj).order_by('-created_time').first()
        return latest_data.latitude_gsm if latest_data else None
    
    def get_latest_longitude(self, obj):
        latest_data = StreetGardData.objects.filter(streetgard=obj).order_by('-created_time').first()
        return latest_data.longitude_gsm if latest_data else None

    def get_latest_updated_time(self, obj):
        latest_data = StreetGardData.objects.filter(streetgard=obj).order_by('-created_time').first()
        return latest_data.created_time if latest_data else None

class StreetGardDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = StreetGardData
        fields = '__all__'


