import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicDestination } from '../../api/publicDestinations';
import type { Destination } from '../../api/destination';
import MapView from '../../components/MapView';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';

export default function DestinationDetail() {
    const { id } = useParams<{ id: string }>();
    const [destination, setDestination] = useState<Destination | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        getPublicDestination(id)
            .then((res) => setDestination(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading)
        return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (!destination)
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">Destination not found.</p>
                <Link to="/" className="text-indigo-600 hover:underline">
                    Back to Dashboard
                </Link>
            </div>
        );

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Back link */}
            <Link to="/" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to all destinations
            </Link>

            {/* Title */}
            <div className="mb-4">
                <h1 className="text-3xl font-bold">{destination.name}</h1>
                <p className="text-gray-600 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {destination.address || 'No address'}
                </p>
            </div>

            {/* Smaller map (height 300px) */}
            <div className="h-72 rounded-lg overflow-hidden shadow mb-6">
                <MapView
                    destinations={[destination]}
                    selectedDest={destination}
                    onMarkerClick={() => { }}
                    center={[destination.latitude, destination.longitude]}
                    zoom={15}
                />
            </div>

            {/* Photo Gallery */}
            <div>
                <h2 className="text-xl font-semibold mb-3">Photos ({destination.photos.length})</h2>
                {destination.photos.length === 0 ? (
                    <p className="text-gray-500">No photos yet.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {destination.photos.map((photo) => (
                            <div key={photo.id} className="rounded-lg overflow-hidden shadow">
                                <img
                                    src={photo.url}
                                    alt={photo.caption || destination.name}
                                    className="w-full h-40 object-cover"
                                />
                                {photo.caption && (
                                    <p className="text-xs p-2 text-gray-600">{photo.caption}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}