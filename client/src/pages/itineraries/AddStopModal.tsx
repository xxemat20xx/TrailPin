import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { getPublicDestinations } from '../../api/publicDestinations';
import type { Destination } from '../../api/destination';
import { useItineraryStore } from '../../stores/itineraryStore';

interface Props {
    onClose: () => void;
}

export default function AddStopModal({ onClose }: Props) {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [query, setQuery] = useState('');
    const { stops, addStop } = useItineraryStore();

    useEffect(() => {
        getPublicDestinations()
            .then((res) => setDestinations(res.data))
            .catch(console.error);
    }, []);

    const filtered = destinations.filter((d) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return d.name.toLowerCase().includes(q) || (d.address && d.address.toLowerCase().includes(q));
    });

    const alreadyAdded = stops.map((s) => s.destination.id);

    const handleAdd = (dest: Destination) => {
        addStop(dest);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add Stop</h2>
                    <button onClick={onClose}><X className="w-5 h-5" /></button>
                </div>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search destinations..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded"
                    />
                </div>
                <ul className="space-y-2">
                    {filtered.map((dest) => (
                        <li key={dest.id} className="p-3 hover:bg-gray-50 rounded border flex justify-between items-center">
                            <div>
                                <p className="font-medium">{dest.name}</p>
                                <p className="text-sm text-gray-500">{dest.address}</p>
                            </div>
                            <button
                                onClick={() => handleAdd(dest)}
                                disabled={alreadyAdded.includes(dest.id)}
                                className="ml-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded disabled:opacity-50"
                            >
                                {alreadyAdded.includes(dest.id) ? 'Added' : 'Add'}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}