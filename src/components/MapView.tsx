import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface MapViewProps {
  currentPosition: [number, number];
  routeCoordinates: [number, number][];
  allRoutePoints: RoutePoint[];
  isPlaying: boolean;
}

// Custom vehicle icon
const vehicleIcon = L.divIcon({
  className: "custom-vehicle-marker",
  html: `
    <div class="relative">
      <div class="absolute -inset-2 bg-primary/20 rounded-full animate-pulse"></div>
      <svg class="w-8 h-8 text-primary drop-shadow-glow relative z-10" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const MapView = ({ currentPosition, routeCoordinates, allRoutePoints, isPlaying }: MapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const fullRouteRef = useRef<L.Polyline | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map("map", {
        center: [19.9975, 73.7898],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Add full route as a faint line
      const fullRoute = allRoutePoints.map((p) => [p.latitude, p.longitude] as [number, number]);
      fullRouteRef.current = L.polyline(fullRoute, {
        color: "#3b82f6",
        weight: 3,
        opacity: 0.3,
        dashArray: "10, 10",
      }).addTo(map);

      // Add traveled route polyline
      polylineRef.current = L.polyline([], {
        color: "#06b6d4",
        weight: 4,
        opacity: 0.8,
      }).addTo(map);

      // Add vehicle marker
      markerRef.current = L.marker(currentPosition, { icon: vehicleIcon }).addTo(map);

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [allRoutePoints]);

  // Update marker position and polyline
  useEffect(() => {
    if (markerRef.current && polylineRef.current) {
      markerRef.current.setLatLng(currentPosition);
      
      if (isPlaying && routeCoordinates.length > 0) {
        polylineRef.current.setLatLngs(routeCoordinates);
        
        // Pan to keep vehicle in view
        if (mapRef.current) {
          mapRef.current.panTo(currentPosition, { animate: true, duration: 0.5 });
        }
      }
    }
  }, [currentPosition, routeCoordinates, isPlaying]);

  return (
    <div className="relative w-full h-screen">
      <div id="map" className="w-full h-full z-0" />
      <style>{`
        .custom-vehicle-marker {
          background: transparent;
          border: none;
        }
        .leaflet-container {
          background: #1a1f2e;
        }
      `}</style>
    </div>
  );
};

export default MapView;
