import React, { useState } from 'react';
import { X, MapPin, Star, ChevronLeft, ChevronRight, Film, MessageSquare, Send } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { addReviewToPlace } from '../store/slices/placeSlice';

export default function PlaceDetailModal({ place, onClose }) {
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const dispatch = useDispatch();

  if (!place) return null;

  const mediaList = place.images && place.images.length > 0 ? place.images : ['/placeholder.jpg'];
  const currentMedia = mediaList[currentMediaIdx];
  const isVideo = (url) => url.match(/\.(mp4|webm|ogg)|video/i);

  const nextMedia = () => setCurrentMediaIdx((prev) => (prev + 1) % mediaList.length);
  const prevMedia = () => setCurrentMediaIdx((prev) => (prev - 1 + mediaList.length) % mediaList.length);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!comment) return;

    dispatch(addReviewToPlace({ placeId: place._id, review: { rating, comment, userName } }));
    setComment('');
  };

  const hasCoords = place.coordinates && place.coordinates.lat !== 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl text-stone-100 relative my-auto">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-3 right-3 z-20 bg-stone-950/80 p-2 rounded-full text-stone-300 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        {/* Media Carousel Header */}
        <div className="relative aspect-video sm:aspect-[21/9] bg-black">
          {isVideo(currentMedia) ? (
            <video src={currentMedia} controls className="w-full h-full object-contain" />
          ) : (
            <img src={currentMedia} alt={place.title} className="w-full h-full object-cover" />
          )}

          {mediaList.length > 1 && (
            <>
              <button onClick={prevMedia} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextMedia} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white">
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 right-3 bg-black/70 px-2.5 py-1 rounded-md text-xs font-mono">
                {currentMediaIdx + 1} / {mediaList.length}
              </div>
            </>
          )}
        </div>

        {/* Info & Map Container */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-md">
                {place.category}
              </span>
              <h2 className="text-2xl font-bold mt-2">{place.title}</h2>
              <div className="flex items-center gap-1.5 text-stone-400 text-xs mt-1">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>{place.location}</span>
              </div>
            </div>

            <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-line">{place.description}</p>
          </div>

          {/* Interactive Mini Map */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 h-52 flex flex-col">
            <span className="text-xs font-medium text-stone-400 mb-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Exact Location Map
            </span>
            {hasCoords ? (
              <div className="flex-1 rounded-lg overflow-hidden relative">
                <MapContainer center={[place.coordinates.lat, place.coordinates.lng]} zoom={14} className="h-full w-full">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[place.coordinates.lat, place.coordinates.lng]}>
                    <Popup>{place.title}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-stone-500 text-center">
                Coordinates not specified
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Reviews & Comments */}
        <div className="p-6 border-t border-stone-800 space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" /> Explorer Reviews
          </h3>

          {/* Review Form */}
          <form onSubmit={handleReviewSubmit} className="space-y-3 bg-stone-950 p-4 rounded-xl border border-stone-800">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Your Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-stone-900 border border-stone-800 text-xs rounded-lg p-2 flex-1 text-stone-200"
              />
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="bg-stone-900 border border-stone-800 text-xs rounded-lg p-2 text-amber-400"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r} ⭐</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Share your experience about this place..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="bg-stone-900 border border-stone-800 text-xs rounded-lg p-2 flex-1 text-stone-200"
              />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Reviews List */}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {place.reviews && place.reviews.length > 0 ? (
              place.reviews.map((rev, idx) => (
                <div key={idx} className="bg-stone-950/60 p-3 rounded-lg border border-stone-800/80 text-xs">
                  <div className="flex justify-between text-stone-400 mb-1">
                    <span className="font-semibold text-stone-200">{rev.userName || 'Explorer'}</span>
                    <span className="text-amber-400">{rev.rating} ⭐</span>
                  </div>
                  <p className="text-stone-300">{rev.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-500">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}