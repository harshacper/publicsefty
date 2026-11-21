import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Crosshair, Search, Loader2 } from 'lucide-react';
import axios from 'axios';

// Custom Leaflet marker icons with reliable SVG
const crimeLocationIcon = L.divIcon({
  className: 'custom-crime-marker',
  html: `<div style="background-color: #dc2626; color: white; border: 2px solid white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.4);">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface MapLocationPickerProps {
  latitude: number;
  longitude: number;
  address: string;
  onLocationChange: (lat: number, lng: number, address: string) => void;
  height?: string;
}

// Subcomponent to smoothly pan map when coordinates change externally
const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Subcomponent to capture map click events and place marker
const LocationMarker: React.FC<{
  position: [number, number];
  onDragEnd: (lat: number, lng: number) => void;
  address: string;
}> = ({ position, onDragEnd, address }) => {
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      onDragEnd(e.latlng.lat, e.latlng.lng);
    },
  });

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const { lat, lng } = marker.getLatLng();
        onDragEnd(lat, lng);
      }
    },
  };

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={crimeLocationIcon}
    >
      <Popup>
        <div className="text-xs">
          <strong className="text-red-600 block mb-1">Crime / Incident Location</strong>
          <span>{address || `${position[0].toFixed(5)}, ${position[1].toFixed(5)}`}</span>
          <div className="text-[10px] text-slate-500 mt-1">Drag marker to adjust exact crime site</div>
        </div>
      </Popup>
    </Marker>
  );
};

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  latitude,
  longitude,
  address,
  onLocationChange,
  height = '350px',
}) => {
  const [currentPosition, setCurrentPosition] = useState<[number, number]>([
    latitude || 12.9716,
    longitude || 77.5946,
  ]);
  const [userGpsPosition, setUserGpsPosition] = useState<[number, number] | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    if (latitude && longitude) {
      setCurrentPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  // Reverse geocode lat,lng to readable address via OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'SmartPoliceComplaintPortal/1.0' }, timeout: 5000 }
      );
      if (response.data && response.data.display_name) {
        onLocationChange(lat, lng, response.data.display_name);
      } else {
        onLocationChange(lat, lng, `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    } catch (err) {
      // Fallback
      onLocationChange(lat, lng, address || `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Browser Geolocation API
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserGpsPosition([lat, lng]);
        setCurrentPosition([lat, lng]);
        reverseGeocode(lat, lng);
        setIsDetectingGps(false);
      },
      (error) => {
        setIsDetectingGps(false);
        let msg = 'Unable to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can select the crime location manually on the map.';
        }
        alert(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Forward geocode search input
  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsGeocoding(true);
    setSearchError('');
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`,
        { headers: { 'User-Agent': 'SmartPoliceComplaintPortal/1.0' }, timeout: 6000 }
      );

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const newLat = parseFloat(result.lat);
        const newLng = parseFloat(result.lon);
        setCurrentPosition([newLat, newLng]);
        onLocationChange(newLat, newLng, result.display_name);
      } else {
        setSearchError('Location not found. Please try entering landmark, city, or move marker manually.');
      }
    } catch (err) {
      setSearchError('Error searching location. Please select directly on the map.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleMarkerDragEnd = (newLat: number, newLng: number) => {
    setCurrentPosition([newLat, newLng]);
    reverseGeocode(newLat, newLng);
  };

  return (
    <div className="space-y-3">
      {/* Control bar: GPS button & Manual Search */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={handleDetectGps}
          disabled={isDetectingGps}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
        >
          {isDetectingGps ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          ) : (
            <Navigation className="w-4 h-4 text-blue-600" />
          )}
          <span>{isDetectingGps ? 'Detecting GPS...' : 'Use My Current Location'}</span>
        </button>

        <form onSubmit={handleSearchLocation} className="flex-1 flex gap-1.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search crime location landmark, street, area, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isGeocoding}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium shadow-sm transition disabled:opacity-50"
          >
            {isGeocoding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Find on Map'}
          </button>
        </form>
      </div>

      {searchError && (
        <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
          {searchError}
        </div>
      )}

      {/* Interactive Map */}
      <div
        className="w-full rounded-lg overflow-hidden border border-slate-300 shadow-sm relative z-0"
        style={{ height }}
      >
        <MapContainer
          center={currentPosition}
          zoom={14}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeView center={currentPosition} zoom={14} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={currentPosition}
            onDragEnd={handleMarkerDragEnd}
            address={address}
          />
        </MapContainer>
      </div>

      {/* Coordinate & Address feedback badge */}
      <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800">Selected Incident Location:</span>
            <div className="text-slate-600 font-medium mt-0.5 line-clamp-2">
              {isGeocoding ? 'Resolving reverse geocode address...' : address || 'Click or drag marker on map to specify location'}
            </div>
          </div>
        </div>
        <div className="text-[11px] text-slate-500 font-mono bg-white px-2 py-1 rounded border border-slate-200 flex-shrink-0 self-start sm:self-center">
          LAT: {currentPosition[0].toFixed(5)}, LNG: {currentPosition[1].toFixed(5)}
        </div>
      </div>
    </div>
  );
};
