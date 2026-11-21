import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getPoliceStations, findNearestStations } from '../services/api';
import { PoliceStation } from '../types';
import {
  Building2,
  Navigation,
  Search,
  Phone,
  MapPin,
  Mail,
  Loader2,
  Compass,
} from 'lucide-react';

// Custom icons
const stationIcon = L.divIcon({
  className: 'custom-station-marker',
  html: `<div style="background-color: #0b2545; color: #f4d06f; border: 2px solid white; border-radius: 8px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.4);">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
  </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

const userLocationIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="background-color: #2563eb; color: white; border: 3px solid white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(37,99,235,0.7);">
    <div style="width: 10px; height: 10px; background-color: white; border-radius: 50%;"></div>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const PanMap: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom = 13 }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const NearestStationFinder: React.FC = () => {
  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([12.9716, 77.5946]); // Bengaluru center default
  const [selectedStation, setSelectedStation] = useState<PoliceStation | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);

  useEffect(() => {
    loadAllStations();
  }, []);

  const loadAllStations = async (city?: string) => {
    setLoading(true);
    try {
      const res = await getPoliceStations({ city: city || undefined });
      if (res.success && res.stations) {
        setStations(res.stations);
        if (res.stations.length > 0 && !userLocation) {
          setMapCenter([res.stations[0].latitude, res.stations[0].longitude]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLocation([lat, lng]);
        setMapCenter([lat, lng]);

        try {
          const res = await findNearestStations({ latitude: lat, longitude: lng });
          if (res.success && res.stations) {
            setStations(res.stations);
            if (res.recommendedStation) {
              setSelectedStation(res.recommendedStation);
            }
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLocatingUser(false);
        }
      },
      (err) => {
        setLocatingUser(false);
        alert('Could not access current location. Please allow GPS permission or search by city.');
      },
      { timeout: 8000 }
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadAllStations(searchCity);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            Public Safety Infrastructure
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Nearest Police Station Finder
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Discover jurisdictional police stations, station phone numbers, and addresses.
          </p>
        </div>

        <button
          onClick={handleLocateMe}
          disabled={locatingUser}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow transition active:scale-95 disabled:opacity-50 self-start sm:self-auto"
        >
          {locatingUser ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span>{locatingUser ? 'Calculating...' : 'Locate Nearest to Me'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by city (e.g. Bengaluru, New Delhi, Mumbai)..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-[#0b2545] hover:bg-blue-900 text-white font-bold text-xs rounded-lg shadow transition"
        >
          Search
        </button>
        {searchCity && (
          <button
            type="button"
            onClick={() => {
              setSearchCity('');
              loadAllStations('');
            }}
            className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs rounded-lg"
          >
            Clear
          </button>
        )}
      </form>

      {/* Main Grid: Interactive Map + Station Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Map */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[500px] relative z-0">
          <MapContainer
            center={mapCenter}
            zoom={12}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <PanMap center={mapCenter} zoom={userLocation ? 13 : 12} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User GPS Pin */}
            {userLocation && (
              <Marker position={userLocation} icon={userLocationIcon}>
                <Popup>
                  <div className="text-xs font-semibold text-blue-700">Your Current Position</div>
                </Popup>
              </Marker>
            )}

            {/* Police Station Pins */}
            {stations.map((st) => (
              <Marker
                key={st._id}
                position={[st.latitude, st.longitude]}
                icon={stationIcon}
                eventHandlers={{
                  click: () => {
                    setSelectedStation(st);
                  },
                }}
              >
                <Popup>
                  <div className="text-xs space-y-1">
                    <strong className="text-blue-900 block font-bold">{st.stationName}</strong>
                    <div className="text-slate-600">{st.address}</div>
                    <div className="text-slate-700 font-semibold mt-1">
                      Phone: <a href={`tel:${st.contactNumber}`} className="text-blue-600 underline">{st.contactNumber}</a>
                    </div>
                    {st.distance !== undefined && (
                      <div className="text-emerald-700 font-bold text-[10px]">
                        Distance: {st.distance} km
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Right: Station List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-1">
            <span>Registered Police Stations ({stations.length})</span>
            {userLocation && <span className="text-emerald-600">Sorted by distance</span>}
          </div>

          {loading ? (
            <div className="p-10 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Loading police stations...</span>
            </div>
          ) : stations.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
              No police stations found for this query. Try searching another city.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {stations.map((st) => {
                const isSelected = selectedStation?._id === st._id;
                return (
                  <div
                    key={st._id}
                    onClick={() => {
                      setSelectedStation(st);
                      setMapCenter([st.latitude, st.longitude]);
                    }}
                    className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-200 shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#0b2545] text-amber-300 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                            {st.stationName}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {st.stationCode}
                          </span>
                        </div>
                      </div>
                      {st.distance !== undefined && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                          {st.distance} km
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>{st.address}</span>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>{st.contactNumber}</span>
                      </div>
                      <a
                        href={`tel:${st.contactNumber}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded text-[11px] shadow-sm transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Call Station
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
