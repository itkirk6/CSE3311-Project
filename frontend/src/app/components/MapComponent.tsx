'use client';

import React, { useEffect, useMemo, useState } from 'react';

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

  // control initial view
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  preferCenter?: boolean; // when true, use center/zoom even if multiple markers
}

const MapComponent: React.FC<MapComponentProps> = ({
  locations,
  userLocation,
  onSelect,
  initialCenter,
  initialZoom,
  preferCenter,
}) => {
  const [MapContent, setMapContent] =
    useState<React.ComponentType<MapComponentProps> | null>(null);
  const [libsReady, setLibsReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let cancelled = false;

    const loadMap = async () => {
      const { MapContainer, TileLayer, Marker, Popup, useMap } = await import('react-leaflet');
      const L = await import('leaflet');

      // Load Leaflet CSS once
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      /**
       * Recenter: runs only when the map is loaded AND the container has size.
       * Disables animation on the first call to avoid race with initial layout.
       */
      const Recenter: React.FC<{
        targets: Array<[number, number]>;
        fallback: { lat: number; lng: number };
        zoom?: number;
        padding?: number;
      }> = ({ targets, fallback, zoom = 12, padding = 56 }) => {
        const map = useMap();

        useEffect(() => {
          if (!map) return;

          const run = () => {
            // ensure container is laid out
            requestAnimationFrame(() => {
              try {
                map.invalidateSize(); // recalc internal sizes

                const size = map.getSize();
                if (!size || size.x < 80 || size.y < 80) return; // still too small, bail

                if (targets.length === 0) {
                  map.setView([fallback.lat, fallback.lng], zoom, { animate: false });
                } else if (targets.length === 1) {
                  const [lat, lng] = targets[0];
                  map.setView([lat, lng], zoom, { animate: false });
                } else {
                  const bounds = L.latLngBounds(targets);
                  map.fitBounds(bounds, { padding: [padding, padding], animate: false });
                }
              } catch (e) {
                // If layout races, a future render (or user interaction) will fix it
                // Avoid throwing to keep the page stable
                console.warn('Leaflet recenter skipped due to early layout:', e);
              }
            });
          };

          // Only run after Leaflet signals ready
          if ((map as any)._loaded) {
            run();
          } else {
            map.once('load', run);
          }
        }, [map, targets, fallback.lat, fallback.lng, zoom, padding]);

        return null;
      };

      // Stable inner component — receives the control props
      const LeafletMap: React.FC<MapComponentProps> = ({
        locations,
        userLocation,
        onSelect,
        initialCenter,
        initialZoom,
        preferCenter,
      }) => {
        const zoom = initialZoom ?? 12;

        const center = useMemo(
          () =>
            initialCenter ||
            userLocation ||
            (locations[0]
              ? { lat: locations[0].latitude, lng: locations[0].longitude }
              : { lat: 32.7357, lng: -97.1081 }), // DFW-ish fallback
          [initialCenter, userLocation, locations]
        );

        const mapKey = `${center.lat},${center.lng},${zoom}`;

        // Size gate: only mount Leaflet when wrapper has real size
        const wrapRef = React.useRef<HTMLDivElement>(null);
        const [hasSize, setHasSize] = React.useState(false);
        const [ready, setReady] = React.useState(false);

        React.useLayoutEffect(() => {
          const el = wrapRef.current;
          if (!el) return;

          const measure = () => {
            const r = el.getBoundingClientRect();
            setHasSize(r.width > 80 && r.height > 80);
          };

          measure();
          const ro = 'ResizeObserver' in window ? new ResizeObserver(measure) : null;
          ro?.observe(el);
          const raf = requestAnimationFrame(measure);

          return () => {
            ro?.disconnect();
            cancelAnimationFrame(raf);
          };
        }, []);

        // Targets derived from markers (used unless preferCenter)
        const targets = useMemo<[number, number][]>(() => {
          if (!locations || locations.length === 0) return [];
          return locations.map((l) => [l.latitude, l.longitude]);
        }, [locations]);

        return (
          <div
            ref={wrapRef}
            className="w-full h-96 rounded-2xl overflow-hidden border border-neutral-800 shadow-lg"
          >
            {hasSize ? (
              <MapContainer
                key={mapKey}
                center={[center.lat, center.lng]}
                zoom={zoom}
                scrollWheelZoom
                doubleClickZoom
                preferCanvas
                style={{ height: '100%', width: '100%' }}
                whenReady={() => {
                  // Give layout one frame before we mark ready
                  requestAnimationFrame(() => setReady(true));
                }}
              >
                {ready && (
                  <>
                    <Recenter
                      targets={preferCenter ? [] : targets}
                      fallback={center}
                      zoom={zoom}
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
                              <p className="text-gray-600 text-sm mt-1">
                                {loc.description}
                              </p>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </>
                )}
              </MapContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-500">
                —
              </div>
            )}
          </div>
        );
      };

      if (!cancelled) {
        setMapContent(() => LeafletMap);
        setLibsReady(true);
      }
    };

    loadMap();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!mounted || !libsReady || !MapContent) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-neutral-900 text-gray-300 rounded-xl border border-neutral-800">
        Loading map...
      </div>
    );
  }

  return (
    <MapContent
      locations={locations}
      userLocation={userLocation}
      onSelect={onSelect}
      initialCenter={initialCenter}
      initialZoom={initialZoom}
      preferCenter={preferCenter}
    />
  );
};

export default MapComponent;
