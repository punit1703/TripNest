import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

// Helper component to auto-center/fit bounds around markers
const MapBoundsFitter = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    if (!markers || markers.length === 0) return;

    const validCoordinates = markers
      .filter(m => m.latitude != null && m.longitude != null)
      .map(m => [m.latitude, m.longitude]);

    if (validCoordinates.length > 0) {
      const bounds = L.latLngBounds(validCoordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [markers, map]);

  return null;
};

// Create a custom modern pin icon for each day
const createCustomIcon = (dayNumber) => {
  return L.divIcon({
    className: 'custom-map-pin-icon',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        background: linear-gradient(135deg, #7c3aed, #4f46e5);
        color: white;
        border-radius: 50%;
        font-weight: 800;
        font-size: 14px;
        box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
        border: 3px solid #ffffff;
        cursor: pointer;
        transform: translate(-50%, -50%);
        transition: transform 0.2s ease;
      ">
        <span style="line-height: 1;">${dayNumber}</span>
        <div style="
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 10px;
          height: 10px;
          background: #4f46e5;
          border-right: 2px solid #ffffff;
          border-bottom: 2px solid #ffffff;
        "></div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -36]
  });
};

const TripMap = ({ itineraryDays, destinationName }) => {
  // Filter days that have valid latitude and longitude
  const validStops = itineraryDays ? itineraryDays.filter(day => day.latitude != null && day.longitude != null) : [];

  // Determine initial center
  const defaultCenter = validStops.length > 0 
    ? [validStops[0].latitude, validStops[0].longitude]
    : [28.6139, 77.2090]; // Default fallback

  if (validStops.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
          <MapPin className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-700 text-base mb-1">No Location Pin Coordinates</h4>
        <p className="text-sm max-w-sm text-slate-400">
          Generate an AI Itinerary or add locations with coordinates to see your interactive map!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-md overflow-hidden relative">
      <div className="flex items-center justify-between px-3 py-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-base">Interactive Trip Map</h4>
            <p className="text-xs text-slate-400">{validStops.length} mapped stop{validStops.length > 1 ? 's' : ''} in {destinationName}</p>
          </div>
        </div>
      </div>

      <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner z-0">
        <MapContainer 
          center={defaultCenter} 
          zoom={12} 
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapBoundsFitter markers={validStops} />
          {validStops.map((stop) => (
            <Marker
              key={stop.id || stop.day || stop.day_number}
              position={[stop.latitude, stop.longitude]}
              icon={createCustomIcon(stop.day || stop.day_number)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-1 max-w-xs font-sans">
                  <div className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md font-bold text-xs mb-1">
                    Day {stop.day || stop.day_number}
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm mb-1">{stop.location_name || `Stop ${stop.day || stop.day_number}`}</h5>
                  <p className="text-xs text-slate-600 leading-snug line-clamp-3">
                    {stop.activity || stop.activity_description}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default TripMap;
