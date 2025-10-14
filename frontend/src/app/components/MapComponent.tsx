'use client';

import React, { useEffect, useState } from 'react';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
}

interface MapComponentProps {
  locations: Location[];
  userLocation?: { lat: number; lng: number } | null;
  onSelect?: (location: Location) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ locations, userLocation, onSelect }) => {
  const [MapContent, setMapContent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    const loadMap = async () => {
      const { MapContainer, TileLayer, Marker, Popup } = await import('react-leaflet');
      const L = await import('leaflet');

      // Dynamically load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Fix missing marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const center = userLocation || { lat: 32.7357, lng: -97.1081 };

      const LeafletMap = () => (
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
          className="rounded-2xl overflow-hidden border border-neutral-800 shadow-lg"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          />

          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]}>
              <Popup>Your Location</Popup>
            </Marker>
          )}

          {locations.map((loc) => (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              eventHandlers={{
                click: () => onSelect?.(loc),
              }}
            >
              <Popup>
                <div className="text-black">
                  <h3 className="font-semibold text-lg text-gray-900">{loc.name}</h3>
                  {loc.description && <p className="text-gray-400 text-sm">{loc.description}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      );

      setMapContent(() => LeafletMap);
    };

    loadMap();
  }, [locations, userLocation, onSelect]);

  if (!MapContent) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-neutral-900 text-gray-300 rounded-xl border border-neutral-800">
        Loading map...
      </div>
    );
  }

  return (
    <div className="w-full h-96 bg-neutral-900 rounded-xl border border-neutral-800">
      <MapContent />
    </div>
  );
};

export default MapComponent;
