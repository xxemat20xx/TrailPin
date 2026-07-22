import { useState, useEffect, useRef } from 'react';
import { createDestination, addPhoto } from '../../api/destination';
import { X, Search } from 'lucide-react';

interface Suggestion {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddDestinationModal({ onClose, onSuccess }: Props) {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [query, setQuery] = useState('');               // user's typed address
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Debounced search
    useEffect(() => {
        if (query.trim().length < 3) {
            setSuggestions([]);
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`,
                    {
                        headers: {
                            'User-Agent': 'TrailPin/1.0 (your-email@example.com)', // optional but recommended
                        },
                    }
                );
                const data: Suggestion[] = await res.json();
                setSuggestions(data);
                setShowSuggestions(true);
            } catch (err) {
                console.error('Geocoding failed', err);
            } finally {
                setIsSearching(false);
            }
        }, 400);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query]);

    // Close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectSuggestion = (suggestion: Suggestion) => {
        setAddress(suggestion.display_name);
        setLatitude(suggestion.lat);
        setLongitude(suggestion.lon);
        if (!name) {
            // Auto‑fill name from the first part of the display name (usually the place name)
            const parts = suggestion.display_name.split(',');
            setName(parts[0].trim());
        }
        setQuery(suggestion.display_name);
        setShowSuggestions(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await createDestination({
                name,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                address,
            });
            const destinationId = res.data.id;

            if (photoFile) {
                const formData = new FormData();
                formData.append('photo', photoFile);
                await addPhoto(destinationId, formData);
            }
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Creation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Add Destination</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    {/* Address search */}
                    <div ref={wrapperRef} className="relative">
                        <label className="block text-sm font-medium mb-1">Search Address *</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                placeholder="Type a place name or address..."
                                required
                                className="w-full border rounded px-3 py-2 pl-9"
                            />
                            <Search className="w-4 h-4 absolute left-2.5 top-3 text-gray-400" />
                            {isSearching && (
                                <div className="absolute right-3 top-3">
                                    <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full" />
                                </div>
                            )}
                        </div>

                        {/* Suggestions dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
                                {suggestions.map((s) => (
                                    <li
                                        key={s.place_id}
                                        onClick={() => selectSuggestion(s)}
                                        className="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm"
                                    >
                                        <div className="font-medium truncate">{s.display_name.split(',')[0]}</div>
                                        <div className="text-xs text-gray-500 truncate">{s.display_name}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Destination Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full border rounded px-3 py-2"
                            placeholder="e.g., Marilaque Highway"
                        />
                    </div>

                    {/* Hidden lat/lng fields (still submitted but not shown) */}
                    <input type="hidden" value={latitude} />
                    <input type="hidden" value={longitude} />

                    {/* Optional: show coordinates as readonly info */}
                    {latitude && longitude && (
                        <p className="text-xs text-gray-500">
                            📍 {latitude}, {longitude}
                        </p>
                    )}

                    {/* Address field (auto‑filled, but editable) */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Full Address</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full border rounded px-3 py-2 text-sm"
                            placeholder="Auto‑filled from selection"
                        />
                    </div>

                    {/* Photo upload */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Photo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !latitude || !longitude}
                        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                        {loading ? 'Creating...' : 'Create Destination'}
                    </button>
                </form>
            </div>
        </div>
    );
}