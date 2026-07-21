import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicDestination } from '../../api/publicDestinations';
import type { Destination } from '../../api/destination';
import MapView from '../../components/MapView';
import { ArrowLeft, MapPin } from 'lucide-react';

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
        <div className="h-screen flex flex-col">
            {/* Top bar */}
            <div className="bg-white border-b px-4 py-3 flex items-center gap-4 shadow-sm">
                <Link to="/" className="text-gray-600 hover:text-gray-900">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold">{destination.name}</h1>
                    <p className="text-sm text-gray-600">{destination.address || 'No address'}</p>
                </div>
            </div>

            {/* Full‑height map */}
            <div className="flex-1 relative">
                <MapView
                    destinations={[destination]}
                    selectedDest={destination}
                    onMarkerClick={() => { }}
                    center={[destination.latitude, destination.longitude]}

                />
            </div>

            {/* Photo gallery below map (or you can overlay) */}
            <div className="p-4 bg-white border-t max-h-60 overflow-y-auto">
                <h2 className="font-semibold mb-2">Photos ({destination.photos.length})</h2>
                {destination.photos.length === 0 ? (
                    <p className="text-gray-500 text-sm">No photos yet.</p>
                ) : (
                    <div className="flex gap-4 flex-wrap">
                        {destination.photos.map((photo) => (
                            <div
                                key={photo.id}
                                className="rounded-lg overflow-hidden shadow w-48 flex-shrink-0"
                            >
                                <img
                                    src={photo.url}
                                    alt={photo.caption || destination.name}
                                    className="w-full h-32 object-cover"
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