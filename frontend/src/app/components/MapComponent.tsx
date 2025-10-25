'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

type Location = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
};

type Props = {
  locations: Location[];
  userLocation?: { lat: number; lng: number } | null;
  onSelect?: (location: Location) => void;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  /** If true, use initialCenter (or first location) instead of fitting all markers */
  preferCenter?: boolean;
};

// Patch default marker icons (Next bundlers won’t resolve the default URLs)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function Recenter({
  targets,
  fallback,
  zoom = 12,
  padding = 56,
}: {
  targets: [number, number][];
  fallback: { lat: number; lng: number };
  zoom?: number;
  padding?: number;
}) {
  const map = useMap();

  useEffect(() => {
    // Run after mount / on targets change
    if (!map) return;

    if (!targets || targets.length === 0) {
      map.setView([fallback.lat, fallback.lng], zoom, { animate: false });
      return;
    }
    if (targets.length === 1) {
      const [lat, lng] = targets[0];
      map.setView([lat, lng], zoom, { animate: false });
      return;
    }

    const bounds = L.latLngBounds(targets);
    map.fitBounds(bounds, { padding: [padding, padding], animate: false });
  }, [map, targets, fallback.lat, fallback.lng, zoom, padding]);

  return null;
}

const MapComponent: React.FC<Props> = ({
  locations,
  userLocation,
  onSelect,
  initialCenter,
  initialZoom = 12,
  preferCenter,
}) => {
  const center = useMemo(
    () =>
      initialCenter ||
      (locations[0]
        ? { lat: locations[0].latitude, lng: locations[0].longitude }
        : { lat: 32.7357, lng: -97.1081 }), // DFW-ish fallback
    [initialCenter, locations]
  );

  const targets = useMemo<[number, number][]>(() => {
    if (!locations || locations.length === 0) return [];
    return locations.map((l) => [l.latitude, l.longitude]);
  }, [locations]);

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden border border-neutral-800 shadow-lg">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={initialZoom}
        scrollWheelZoom
        doubleClickZoom
        preferCanvas
        style={{ height: '100%', width: '100%' }}
      >
        {/* Recenter AFTER the map exists */}
        <Recenter
          targets={preferCenter ? [] : targets}
          fallback={center}
          zoom={initialZoom}
          padding={56}
        />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
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
            eventHandlers={{ click: () => onSelect?.(loc) }}
          >
            <Popup>
              <div className="text-black">
                <a
                  href={`/location?id=${encodeURIComponent(loc.id)}`}
                  className="font-semibold text-lg text-emerald-600 hover:underline"
                >
                  {loc.name}
                </a>
                {loc.description && (
                  <p className="text-gray-600 text-sm mt-1">{loc.description}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
