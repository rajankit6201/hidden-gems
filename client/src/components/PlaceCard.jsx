import React from 'react';
import { useDispatch } from 'react-redux';
import { toggleLikePlace } from '../store/slices/placeSlice'; // Correct import path
import { Heart, MapPin } from 'lucide-react';

export default function PlaceCard({ place, onSelect }) {
  const dispatch = useDispatch();

  const handleLike = (e) => {
    e.stopPropagation();
    if (place._id || place.id) {
      dispatch(toggleLikePlace(place._id || place.id));
    }
  };

  return (
    <div
      onClick={() => onSelect && onSelect(place)}
      className="bg-stone-800/60 border border-stone-700/60 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all cursor-pointer group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={place.image || place.imageUrl || 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=800'}
          alt={place.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={handleLike}
          className="absolute top-3 right-3 p-2 rounded-full bg-stone-900/60 backdrop-blur-md text-stone-200 hover:text-red-500 transition-colors"
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-stone-100 text-lg">{place.title}</h3>
        <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
          <MapPin className="w-3.5 h-3.5" />
          {place.location}
        </p>
      </div>
    </div>
  );
}