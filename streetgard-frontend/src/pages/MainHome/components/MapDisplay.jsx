import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import { streetgard_list } from '@/apis/core';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const streetLightIconActive = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/9830/9830827.png',
  iconSize: [46, 46],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const streetLightIconInactive = new L.Icon({
  iconUrl: 'https://cdn-icons-png.freepik.com/512/2967/2967033.png',
  iconSize: [46, 46],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Create a custom CSS class for the blinking effect
const addBlinkingStyle = () => {
  if (!document.getElementById('blinking-style')) {
    const style = document.createElement('style');
    style.id = 'blinking-style';
    style.innerHTML = `
      @keyframes blink {
        0% { opacity: 1; }
        50% { opacity: 0.3; }
        100% { opacity: 1; }
      }
      .blinking-circle {
        animation: blink 1.5s infinite;
        border-radius: 50%;
        background-color: #ef4444;
        border: 2px solid white;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
      }
    `;
    document.head.appendChild(style);
  }
};

const MapWithMarkers = ({ streetGuards, navigate }) => {
    const map = useMap();

    useEffect(() => {
        if (!streetGuards || streetGuards.length === 0) return;
        
        // Add the blinking style to the document
        addBlinkingStyle();
        
        const bounds = L.latLngBounds();
        
        streetGuards.forEach(guard => {
            // if (!guard.latest_latitude && !guard.latest_longitude) return;
            const latLng = [guard.latest_latitude || 13.073697, guard.latest_longitude || 77.499855];
            
            bounds.extend(latLng);
            
            const marker = L.marker(latLng, { icon: guard.latest_bulb_status ? streetLightIconActive : streetLightIconInactive }).addTo(map);
            
            // Add blinking alert point for inactive street lights
            if (!guard.latest_bulb_status) {
                // Create a custom HTML element for the blinking point
                const alertIcon = L.divIcon({
                    html: `<div class="blinking-circle" style="width: 16px; height: 16px;"></div>`,
                    className: '',
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                });
                
                // Position the blinking point just slightly above the marker (much closer than before)
                const alertLatLng = [
                    latLng[0] + 0.000001, // Very slightly above the marker
                    latLng[1] - 0.00001
                ];
                
                // Add the blinking point to the map
                L.marker(alertLatLng, { icon: alertIcon, interactive: false }).addTo(map);
            }
            
            const popupContent = `
                <div style="min-width: 200px; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #333;">${guard.name}</h3>
                    <p style="margin: 4px 0; font-size: 14px;">
                        <strong>Status:</strong> 
                        <span style="color: ${guard.latest_bulb_status ? '#22c55e' : '#ef4444'}">
                            ${guard.latest_bulb_status ? 'Active' : 'Inactive'}
                        </span>
                    </p>
                    <p style="margin: 4px 0; font-size: 14px;">
                        <strong>Last Updated:</strong> ${new Date(guard.latest_updated_time).toLocaleString()}
                    </p>
                    <button 
                        id="view-details-${guard.id}" 
                        style="
                            margin-top: 8px;
                            padding: 6px 12px;
                            background-color: #3b82f6;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-weight: 500;
                            width: 100%;
                        "
                    >
                        View Details
                    </button>
                </div>
            `;
            const popup = marker.bindPopup(popupContent);
            popup.on('popupopen', () => {
                setTimeout(() => {
                    const button = document.getElementById(`view-details-${guard.id}`);
                    if (button) {
                        button.addEventListener('click', () => {
                            navigate(`/controller?id=${guard.id}`);
                        });
                    }
                }, 100);
            });
        });
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        } else {
            map.setView([13.073697, 77.499855], 5);
        }

    }, [map, streetGuards, navigate]);

    return null;
};

const MapDisplay = () => {
    const [streetGuards, setStreetGuards] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStreetGuards = async () => {
            try {
                const response = await streetgard_list();
                console.log('Street guards data:', response.data);
                setStreetGuards(response.data);
            } catch (error) {
                console.error('Error fetching street guards:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchStreetGuards();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-gray-600 font-medium">Loading map data...</p>
            </div>
        );
    }
    
    return (
        <div className="flex-col -z-1 w-full h-full rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            <MapContainer
                zoom={5} 
                className="h-full w-full" 
                style={{ minHeight: "500px" }}
            >
                <TileLayer
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a> contributors'
                />
                <MapWithMarkers streetGuards={streetGuards} navigate={navigate} />
            </MapContainer>
        </div>
    );
};

export default MapDisplay;
