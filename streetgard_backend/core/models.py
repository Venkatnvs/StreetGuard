from django.db import models
import uuid

class StreetGard(models.Model):
    name = models.CharField(max_length=255)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    img = models.ImageField(upload_to='streetgard/', null=True, blank=True)
    created_time = models.DateTimeField(auto_now_add=True)
    updated_time = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
class StreetGardData(models.Model):
    streetgard = models.ForeignKey(StreetGard, on_delete=models.CASCADE)
    temp_dht = models.FloatField()
    humidity_dht = models.FloatField()
    temp_bmp = models.FloatField()
    pressure_bmp = models.FloatField()
    altitude_bmp = models.FloatField()
    relativeheight_bmp = models.FloatField()
    latitude_gsm = models.FloatField()
    longitude_gsm = models.FloatField()
    rainsensor = models.FloatField()
    servo_state = models.BooleanField()
    pir_state = models.BooleanField()
    relay_state = models.BooleanField()
    ldr_state = models.BooleanField()
    bulb_state = models.BooleanField()
    created_time = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.streetgard.name} - {self.created_time}"
    
    
