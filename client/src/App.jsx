import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlaces, setFilter } from './store/slices/placeSlice';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import PlaceCard from './components/PlaceCard';
import PlaceDetailModal from './components/PlaceDetailModal';
import { Search, Loader2, Sparkles } from 'lucide-react';
import AddPlace from './pages/AddPlace';

const CATEGORIES = ['All', 'Lakes', 'Forts & History', 'Nature & Trails', 'Food & Cafes', 'Hidden Spots'];

function Home() {
  const dispatch = useDispatch();
  
  // Safe extraction with default fallback
  const { items: rawPlaces, loading, error, filterCategory } = useSelector((state) => state.places);
  
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchPlaces());
  }, [dispatch]);

  const handleCategoryChange = (cat) => {
    dispatch(setFilter(cat));
  };

  // Safe Array Extraction Guard
  const safePlacesArray = useMemo(() => {
    if (Array.isArray(rawPlaces)) return rawPlaces;
    if (rawPlaces && Array.isArray(rawPlaces.places)) return rawPlaces.places;
    if (rawPlaces && Array.isArray(rawPlaces.data)) return rawPlaces.data;
    return [];
  }, [rawPlaces]);

  // Safe Filtering logic with Optional Chaining
  const filteredPlaces = useMemo(() => {
    return safePlacesArray.filter((p) => {
      if (!p || typeof p !== 'object') return false;

      const matchesCat =
        !filterCategory ||
        filterCategory === 'All' ||
        p.category?.toLowerCase() === filterCategory?.toLowerCase();

      const searchLower = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !searchLower ||
        p.title?.toLowerCase().includes(searchLower) ||
        p.location?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower);

      return matchesCat && matchesSearch;
    });
  }, [safePlacesArray, filterCategory, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/60 border border-emerald-800/80 rounded-full text-emerald-400 text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>City of Lakes Travel Guide</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-100 tracking-tight leading-tight">
          Discover Secret Gems of <span className="text-emerald-400">Bhopal</span>
        </h1>
        <p className="text-stone-400 mt-3 text-sm sm:text-base">
          Uncover tranquil lake views, ancient heritage sites, scenic hiking trails, and street food paradises.
        </p>

        {/* Search Bar */}
        <div className="mt-6 relative max-w-xl mx-auto">
          <Search className="w-5 h-5 text-stone-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search spots, lakes, locations..."
            className="w-full bg-stone-800/90 border border-stone-700/80 rounded-xl pl-11 pr-4 py-3 text-stone-100 placeholder-stone-400 text-sm focus:outline-none focus:border-emerald-500 shadow-lg"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none justify-start sm:justify-center">
        {CATEGORIES.map((cat) => {
          const isActive =
            (cat === 'All' && (!filterCategory || filterCategory === 'All')) ||
            filterCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                  : 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
          <p className="text-sm">Fetching Bhopal's best spots...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400 text-sm">{error}</div>
      ) : filteredPlaces.length === 0 ? (
        <div className="text-center py-16 bg-stone-800/30 rounded-2xl border border-stone-800">
          <p className="text-stone-300 font-medium">No places found</p>
          <p className="text-xs text-stone-500 mt-1">Try searching for something else or change category filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => (
            <PlaceCard key={place._id || place.id} place={place} onSelect={setSelectedPlace} />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPlace && (
        <PlaceDetailModal place={selectedPlace} onClose={() => setSelectedPlace(null)} />
      )}
    </div>
  );
}

export default function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans">
        <Navbar onOpenAuth={() => setIsAuthOpen(true)} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add-spot" element={<AddPlace />} />
          </Routes>
        </main>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    </Router>
  );
}