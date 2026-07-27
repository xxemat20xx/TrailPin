import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useItineraryStore } from '../../stores/itineraryStore';
import MapView from '../../components/MapView';
import StopList from './StopList';
import AddStopModal from './AddStopModal';
import { calculateRoute, getItinerary, createItinerary, updateItinerary } from '../../api/itinerary';
import { getPublicDestination } from '../../api/publicDestinations';

export default function ItineraryPlanner() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const destIdFromQuery = searchParams.get('dest');

    const {
        name,
        stops,
        setName,
        addStop,
        removeStop,
        reorderStops,
        clear,
    } = useItineraryStore();

    const [showAddModal, setShowAddModal] = useState(false);
    const [polyline, setPolyline] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Calculate route whenever stops change
    useEffect(() => {
        if (stops.length >= 2) {
            const coords = stops.map(s => ({
                lat: s.destination.latitude,
                lng: s.destination.longitude,
            }));
            calculateRoute(coords)
                .then(res => {
                    const geoJSON = JSON.parse(res.data.polyline);
                    setPolyline(geoJSON);
                })
                .catch(err => console.error('Route calculation failed:', err));
        } else {
            setPolyline(null);
        }
    }, [stops]);

    // Load existing itinerary or start a new one
    useEffect(() => {
        if (id) {
            // editing existing itinerary
            setLoading(true);
            getItinerary(id)
                .then(res => {
                    const { name, stops: backendStops } = res.data;
                    setName(name);
                    useItineraryStore.setState({
                        stops: backendStops.map((s: any) => ({
                            id: crypto.randomUUID(), // local unique id for drag‑and‑drop
                            destination: s.destination,
                        })),
                    });
                })
                .catch(err => console.error('Failed to load itinerary:', err))
                .finally(() => setLoading(false));
        } else {
            // new itinerary
            clear();
            if (destIdFromQuery) {
                getPublicDestination(destIdFromQuery)
                    .then(res => {
                        addStop(res.data);
                    })
                    .catch(err => console.error('Failed to load starting destination:', err));
            }
        }
    }, [id, destIdFromQuery]);

    const handleSave = async () => {
        if (!name.trim() || stops.length === 0) {
            alert('Please give your itinerary a name and add at least one stop.');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name,
                stops: stops.map((s, idx) => ({
                    destinationId: s.destination.id,
                    order: idx + 1,
                })),
            };

            if (id) {
                await updateItinerary(id, payload);
            } else {
                await createItinerary(payload);
            }
            navigate('/dashboard'); // or to a dedicated itinerary list page
        } catch (err) {
            console.error('Save failed:', err);
            alert('Failed to save itinerary.');
        } finally {
            setSaving(false);
        }
    };

    // Determine the map center: first stop if available, else default
    const mapCenter: [number, number] =
        stops.length > 0
            ? [stops[0].destination.latitude, stops[0].destination.longitude]
            : [14.6, 121.0]; // default to Philippines

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <aside className="w-96 bg-white border-r flex flex-col">
                {/* Compact map */}
                <div className="h-56 border-b">
                    <MapView
                        destinations={stops.map(s => s.destination)}
                        showNumbers={true}
                        center={mapCenter}
                        zoom={stops.length > 0 ? 12 : 8}
                        polyline={polyline}
                    />
                </div>

                {/* Name input */}
                <div className="p-4 border-b">
                    <input
                        type="text"
                        placeholder="Itinerary name..."
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* Stop list (drag‑and‑drop) */}
                <div className="flex-1 overflow-y-auto p-4">
                    <StopList />
                </div>

                {/* Action buttons */}
                <div className="p-4 border-t space-y-2">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
                    >
                        + Add Stop
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {id ? 'Update Itinerary' : 'Save Itinerary'}
                    </button>
                </div>
            </aside>

            {/* Main area – can be used for route details or left blank */}
            <main className="flex-1 bg-gray-50 p-6">
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <p className="text-lg">Route preview and details will appear here.</p>
                    {/* You can optionally display distance/duration summary here later */}
                </div>
            </main>

            {/* Add stop modal */}
            {showAddModal && (
                <AddStopModal onClose={() => setShowAddModal(false)} />
            )}
        </div>
    );
}