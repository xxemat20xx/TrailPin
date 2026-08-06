import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getItineraries, deleteItinerary } from '../../api/itinerary';
import { useAuthStore } from '../../stores/authStore';
import { MapPin, Clock, Route, Pen, Trash2, Eye } from 'lucide-react';

export default function MyItineraries() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/my-itineraries');
      return;
    }
    fetchItineraries();
  }, [user]);

  const fetchItineraries = async () => {
    try {
      const res = await getItineraries();
      setItineraries(res.data);
    } catch (err) {
      console.error('Failed to fetch itineraries', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteItinerary(id);
      setItineraries(prev => prev.filter(it => it.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete itinerary');
    }
  };

  const getCoverPhoto = (itinerary: any) =>
    itinerary.coverPhoto ||
    itinerary.stops?.[0]?.photos?.[0]?.url ||
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200';

  if (!user) return null; // redirect handled in useEffect

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900">My Itineraries</h1>
            <p className="text-gray-500 mt-2">Manage your rides and plan new adventures.</p>
          </div>
          <button
            onClick={() => navigate('/itineraries/new')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition"
          >
            + Create New
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading your itineraries...</div>
        ) : itineraries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">You haven't created any itineraries yet.</p>
            <button
              onClick={() => navigate('/itineraries/new')}
              className="text-orange-500 font-semibold hover:underline"
            >
              Create your first ride
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map(it => (
              <div key={it.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden">
                <img
                  src={getCoverPhoto(it)}
                  alt={it.name}
                  className="h-40 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-900 truncate">{it.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {it.stops?.length || 0} stops · {it.estimatedTime || '—'}
                  </p>
                  {it.totalDistance && (
                    <p className="text-xs text-gray-400 mt-1">{it.totalDistance.toFixed(1)} km</p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => navigate(`/itineraries/${it.id}`)}
                      className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <div className="flex gap-2">
                      {/* <button
                        onClick={() => navigate(`/itineraries/${it.id}?edit=true`)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      >
                        <Pen className="w-4 h-4" />
                      </button> */}
                      <button
                        onClick={() => handleDelete(it.id, it.name)}
                        className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}