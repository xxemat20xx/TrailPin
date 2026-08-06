import { useEffect, useState } from 'react';
import { getPublicItineraries } from '../../api/itinerary';
import ForumCard from '../../components/forum/ForumCard';
import { Compass } from 'lucide-react';

export default function Forum() {
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicItineraries()
      .then(res => setItineraries(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-24 text-center">
        <p className="text-gray-500">Loading forum...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-10 text-center">
          <Compass className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-4xl font-black text-gray-900">Riders Forum</h1>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Discuss routes, share tips, and connect with fellow riders.
          </p>
        </div>

        <div className="space-y-6">
          {itineraries.length === 0 ? (
            <p className="text-center text-gray-500">No routes shared yet.</p>
          ) : (
            itineraries.map((itin) => (
              <ForumCard key={itin.id} itinerary={itin} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}