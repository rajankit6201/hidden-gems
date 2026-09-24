import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Check, MapPin } from 'lucide-react';

// Fix Leaflet Default Icon Issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Click Listener Component inside Map
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function MapPickerModal({ isOpen, onClose, onSelectLocation, initialCoords }) {
  const defaultCenter = initialCoords?.lat && initialCoords?.lng 
    ? [initialCoords.lat, initialCoords.lng] 
    : [23.259933, 77.412613]; // Bhopal Default Center

  const [position, setPosition] = useState(defaultCenter);
  const [loadingAddress, setLoadingAddress] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!position) return;
    setLoadingAddress(true);

    const lat = position[0].toFixed(6);
    const lng = position[1].toFixed(6);
    let locationName = '';

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        locationName = data.address?.suburb || data.address?.neighbourhood || data.address?.city || data.display_name.split(',')[0];
      }
    } catch (err) {
      console.log('Reverse geocoding error');
    }

    onSelectLocation({ lat, lng, locationName });
    setLoadingAddress(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950">
          <div className="flex items-center gap-2 text-stone-100 font-semibold text-sm">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Click on Map to Pick Location</span>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-100 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Leaflet Map Container */}
        <div className="flex-1 relative">
          <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full z-10">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex items-center justify-between">
          <div className="text-xs text-stone-400 font-mono">
            Selected: <span className="text-emerald-400">{position ? `${position[0].toFixed(4)}, ${position[1].toFixed(4)}` : 'None'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-stone-800 text-stone-300 hover:bg-stone-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loadingAddress}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950"
            >
              <Check className="w-4 h-4" />
              <span>{loadingAddress ? 'Fetching Place Name...' : 'Confirm Location'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}