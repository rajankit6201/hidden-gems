import React, { useState } from 'react';
import PlaceDetailModal from '../components/PlaceDetailModal';

export default function Home() {
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Redux se places fetch karein (ya state se)
  // const places = useSelector((state) => state.places.items);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place) => (
          <div
            key={place._id}
            onClick={() => setSelectedPlace(place)}
            className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-all"
          >
            <img src={place.images[0]} alt={place.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="font-bold text-stone-100">{place.title}</h3>
              <p className="text-xs text-stone-400">{place.location}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedPlace && (
        <PlaceDetailModal
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
        />
      )}
    </div>
  );
}