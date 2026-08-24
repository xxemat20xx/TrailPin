import { useEffect, useState } from 'react';
import { getAllStopPhotos } from '../api/publicDestinations'; // adjust import path
import { Link } from 'react-router-dom';
import { Camera, X, MapPin, ArrowRight } from 'lucide-react';

interface StopPhoto {
  id: string;
  url: string;
  caption?: string;
  createdAt: string;
  stopName: string;
  itineraryId: string;
  itineraryName: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export default function StopPhotos() {
  const [photos, setPhotos] = useState<StopPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<StopPhoto | null>(null);

  useEffect(() => {
    getAllStopPhotos()
      .then(res => setPhotos(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Close preview on Escape key
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setSelectedPhoto(null);
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-24 text-center">
        <p className="text-gray-500">Loading photos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <Camera className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-4xl font-black text-gray-900">Rider Photos</h1>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Scenic stops, pit stops, and unforgettable moments shared by the community.
          </p>
        </div>

        {photos.length === 0 ? (
          <p className="text-center text-gray-500">No photos yet. Be the first to share!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map(photo => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.caption || photo.stopName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <p className="text-sm font-semibold truncate">{photo.stopName}</p>
                  <p className="text-xs text-gray-300 truncate">{photo.itineraryName}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <img
                      src={photo.user?.avatar || 'https://via.placeholder.com/20'}
                      alt=""
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span>{photo.user?.name || 'Unknown rider'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Preview Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image */}
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || selectedPhoto.stopName}
              className="w-full h-auto max-h-[80vh] object-contain"
            />

            {/* Photo info bar */}
            <div className="bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-bold text-lg">{selectedPhoto.stopName}</p>
                <p className="text-sm text-gray-500">{selectedPhoto.itineraryName}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <img
                    src={selectedPhoto.user?.avatar || 'https://via.placeholder.com/20'}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span>{selectedPhoto.user?.name || 'Unknown rider'}</span>
                </div>
                {selectedPhoto.caption && (
                  <p className="mt-2 text-sm text-gray-700 italic">“{selectedPhoto.caption}”</p>
                )}
              </div>
              <Link
                to={`/itineraries/${selectedPhoto.itineraryId}`}
                className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition"
              >
                <MapPin className="w-4 h-4" />
                View Full Route
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}