import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createPlace } from '../store/slices/placeSlice';
import ExifReader from 'exifreader';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../utils/firebase';
import MapPickerModal from '../components/MapPickerModal';
import { UploadCloud, Loader2, AlertCircle, Compass, X, Film, Map } from 'lucide-react';

const MAX_FILES = 20;
const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500 MB

export default function AddPlace() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Lakes',
    location: '',
    latitude: '',
    longitude: ''
  });

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [geoStatusMsg, setGeoStatusMsg] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const objectUrls = files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1)
    }));
    setPreviews(objectUrls);

    return () => {
      objectUrls.forEach(item => URL.revokeObjectURL(item.url));
    };
  }, [files]);

  // Handle Location selection from Map Picker Modal
  const handleMapLocationSelect = ({ lat, lng, locationName }) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location: locationName || prev.location
    }));
    setGeoStatusMsg('✨ Location picked directly from Map!');
  };

  // Browser Geolocation Detection
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Aapke browser me Geolocation supported nahi hai.");
      return;
    }

    setIsLocating(true);
    setGeoStatusMsg("Fetching device GPS location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          if (data && data.display_name) {
            const shortLocation = data.address?.suburb || data.address?.neighbourhood || data.address?.city || data.display_name.split(',')[0];
            setFormData((prev) => ({ ...prev, location: shortLocation }));
          }
        } catch (err) {
          console.log("Reverse geocoding failed");
        }

        setIsLocating(false);
        setGeoStatusMsg("✨ Device GPS Location Auto-Filled!");
      },
      () => {
        setIsLocating(false);
        setErrorMsg("Location access denied ya GPS signal weak hai.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // EXIF Extraction
  const handleFileChange = async (e) => {
    setErrorMsg('');
    setGeoStatusMsg('');
    const newFiles = Array.from(e.target.files);
    const combinedFiles = [...files, ...newFiles];

    if (combinedFiles.length > MAX_FILES) {
      setErrorMsg(`Aap maximum ${MAX_FILES} files hi upload kar sakte hain.`);
      return;
    }

    const totalSize = combinedFiles.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      setErrorMsg(`Total file size 500MB se zyada hai (${(totalSize / (1024 * 1024)).toFixed(1)}MB).`);
      return;
    }

    setFiles(combinedFiles);

    const primaryFile = combinedFiles.find((f) => f.type.startsWith('image/'));
    if (primaryFile) {
      try {
        const tags = await ExifReader.load(primaryFile);
        if (tags.GPSLatitude && tags.GPSLongitude) {
          const lat = tags.GPSLatitude.description;
          const lng = tags.GPSLongitude.description;
          setFormData((prev) => ({
            ...prev,
            latitude: parseFloat(lat).toFixed(6),
            longitude: parseFloat(lng).toFixed(6)
          }));
          setGeoStatusMsg("✨ GPS Coordinates auto-extracted from photo EXIF data!");
        }
      } catch (err) {
        setGeoStatusMsg("Photo me EXIF location metadata nahi mila.");
      }
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setErrorMsg('Kam se kam 1 photo ya video upload karein.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      const uploadedUrls = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageRef = ref(storage, `places/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = Math.round(((i + snapshot.bytesTransferred / snapshot.totalBytes) / files.length) * 100);
              setUploadProgress(progress);
            },
            (error) => reject(error),
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedUrls.push(url);
              resolve();
            }
          );
        });
      }

      const placePayload = {
        ...formData,
        images: uploadedUrls,
        coordinates: {
          lat: parseFloat(formData.latitude) || 0,
          lng: parseFloat(formData.longitude) || 0
        }
      };

      const res = await dispatch(createPlace(placePayload));
      if (!res.error) {
        navigate('/');
      } else {
        setErrorMsg(res.payload || 'Failed to publish place.');
      }
    } catch (err) {
      setErrorMsg('Media upload me error aaya. Check Firebase Config.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-100 mb-1">Add New Hidden Spot</h1>
            <p className="text-xs text-stone-400">Share secret locations of Bhopal with photos, videos, and geo-data.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMapOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-medium transition-all shadow-md shadow-emerald-950"
            >
              <Map className="w-4 h-4" />
              <span>Pick on Map</span>
            </button>

            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-3 py-2 rounded-xl text-xs font-medium transition-all"
            >
              {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4 text-emerald-400" />}
              <span>Auto GPS</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-950/70 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {geoStatusMsg && (
          <div className="mb-6 p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <Compass className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{geoStatusMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Media Upload Zone */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-2">
              Upload Photos & Videos (Max 20 Files / 500MB)
            </label>
            
            <div className="border-2 border-dashed border-stone-700 hover:border-emerald-500 rounded-xl p-6 text-center bg-stone-950/50 cursor-pointer transition-colors relative">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-stone-200">Click ya Drag karke media select karein</p>
              <p className="text-xs text-stone-500 mt-1">Supports Photos & MP4 Videos</p>
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                  <span>Selected Media ({previews.length}/{MAX_FILES})</span>
                  <span>Total: {(files.reduce((a, b) => a + b.size, 0) / (1024 * 1024)).toFixed(1)} MB</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {previews.map((item, idx) => (
                    <div key={idx} className="relative group bg-stone-800 rounded-lg overflow-hidden border border-stone-700 aspect-square">
                      {item.type.startsWith('image/') ? (
                        <img src={item.url} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-stone-950 text-emerald-400 p-2 text-center">
                          <Film className="w-6 h-6 mb-1" />
                          <span className="text-[10px] truncate max-w-full text-stone-300">{item.name}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 bg-black/70 text-stone-200 hover:text-red-400 p-1 rounded-full transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-400 mb-1">Spot Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Kerwa Dam View Point"
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option>Lakes</option>
                <option>Forts & History</option>
                <option>Nature & Trails</option>
                <option>Food & Cafes</option>
                <option>Hidden Spots</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">Location Name</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Near VIP Road"
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">Latitude</label>
              <input
                type="text"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="23.2599"
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">Longitude</label>
              <input
                type="text"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="77.4126"
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-400 mb-1">Detailed Description</label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe why this place is special, best time to visit..."
              className="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-stone-100 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            {isUploading && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-stone-400 mb-1">
                  <span>Uploading Media to Cloud Storage...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 text-sm"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Travel Gem'}
            </button>
          </div>
        </form>
      </div>

      {/* Interactive Map Modal */}
      <MapPickerModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelectLocation={handleMapLocationSelect}
        initialCoords={{ lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) }}
      />
    </div>
  );
}