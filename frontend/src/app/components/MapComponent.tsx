'use client';

import React, { useEffect, useState } from 'react';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  activities: string[];
  rating: number;
  price: number;
  images: string[];
  availability: boolean;
  weather?: {
    temperature: number;
    condition: string;
    description: string;
    icon: string;
  };
}

interface MapComponentProps {
  locations: Location[];
  userLocation?: { lat: number; lng: number } | null;
  distances: { [key: string]: number };
  onLocationSelect?: (location: Location) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ locations, userLocation, distances, onLocationSelect }) => {
  const [isClient, setIsClient] = useState(false);
  const [MapContent, setMapContent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Dynamically import Leaflet components only on client side
    const loadLeafletMap = async () => {
      try {
        const { MapContainer, TileLayer, Marker, Popup, Circle } = await import('react-leaflet');
        const L = await import('leaflet');
        
        // Dynamically load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
        document.head.appendChild(link);

        // Fix for default markers in react-leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Custom icons
        const createCustomIcon = (color: string, icon: string) => {
          return L.divIcon({
            html: `
              <div style="
                background-color: ${color};
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 3px solid white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">
                ${icon}
              </div>
            `,
            className: 'custom-div-icon',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });
        };

        const userLocationIcon = createCustomIcon('#2563eb', '📍');
        const campsiteIcon = createCustomIcon('#f97316', '🏕️');

        const defaultCenter = userLocation || { lat: 32.7357, lng: -97.1081 };

        const LeafletMapContent = () => (
          <div className="w-full h-96 rounded-lg shadow-md overflow-hidden">
            <MapContainer
              center={[defaultCenter.lat, defaultCenter.lng]}
              zoom={10}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* User location marker and circle */}
              {userLocation && (
                <>
                  <Marker
                    position={[userLocation.lat, userLocation.lng]}
                    icon={userLocationIcon}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-blue-600">📍 Your Location</h3>
                        <p className="text-sm text-gray-600">
                          {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                  <Circle
                    center={[userLocation.lat, userLocation.lng]}
                    radius={16093} // 10 miles in meters
                    pathOptions={{
                      color: '#2563eb',
                      fillColor: '#2563eb',
                      fillOpacity: 0.1,
                      weight: 2
                    }}
                  />
                </>
              )}

              {/* Location markers */}
              {locations && locations.map((location) => {
                const distance = distances && distances[location.id];
                return (
                  <Marker
                    key={location.id}
                    position={[location.latitude || 0, location.longitude || 0]}
                    icon={campsiteIcon}
                    eventHandlers={{
                      click: () => {
                        if (onLocationSelect) {
                          onLocationSelect(location);
                        }
                      }
                    }}
                  >
                    <Popup>
                      <div className="p-2 max-w-xs">
                        <h3 className="font-semibold text-gray-900 mb-2">{location.name || 'Unnamed Location'}</h3>
                        <p className="text-sm text-gray-600 mb-1">{location.address || 'Address not available'}</p>
                        <p className="text-sm text-gray-600 mb-2">{location.city || 'Unknown'}, {location.state || 'Unknown'}</p>
                        {distance && (
                          <p className="text-sm font-semibold text-blue-600 mb-2">
                            📍 {distance.toFixed(1)} miles away
                          </p>
                        )}
                        <div className="flex items-center mb-2">
                          <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                          <span className="ml-2 text-sm text-gray-600">({location.rating || 'N/A'})</span>
                        </div>
                        <p className="text-sm font-semibold text-green-600">
                          ${location.price || 'N/A'}/night
                        </p>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            Activities: {location.activities && location.activities.length > 0 ? location.activities.join(', ') : 'No activities listed'}
                          </p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        );

        setMapContent(() => LeafletMapContent);
      } catch (error) {
        console.error('Error loading Leaflet:', error);
      }
    };

    loadLeafletMap();
  }, [locations, userLocation, distances, onLocationSelect]);

  if (!isClient || !MapContent) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-orange-100 flex items-center justify-center rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <div className="text-lg font-semibold text-gray-800">Loading Interactive Map...</div>
          <div className="text-sm text-gray-600 mt-1">Powered by Leaflet (Free & Open Source)</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Interactive Map</h3>
        <div className="flex items-center space-x-4">
          {userLocation && (
            <span className="text-sm text-gray-600">
              Showing distances from your location
            </span>
          )}
          <span className="text-xs text-gray-500 bg-green-100 px-2 py-1 rounded">
            🆓 Free Leaflet Maps
          </span>
        </div>
      </div>
      <MapContent />
    </div>
  );
};

export default MapComponent;