import { useState, useEffect, useRef } from "react";
import { X, Search, AlertCircle, ImagePlus, Trash2 } from "lucide-react";
import type { Destination } from "../../api/destination";
import { useDestinationStore } from "../../stores/destinationStore";
import { useAuthStore } from "../../stores/authStore";
import { useNavigate } from "react-router-dom";
import { addPhoto } from "../../api/destination";

interface Prediction {
    place_id: string;
    description: string;   // the full suggestion text
    structured_formatting?: {
        main_text: string;
        secondary_text: string;
    };
}

interface Props {
    mode: "add" | "edit";
    destination?: Destination | null;
    onClose: () => void;
}

export default function DestinationFormModal({
    mode,
    destination,
    onClose,
}: Props) {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const { addDestination, editDestination, fetchDestinations } =
        useDestinationStore();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [query, setQuery] = useState("");
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);



    // Prefill form when editing
    useEffect(() => {
        if (mode === "edit" && destination) {
            setName(destination.name);
            setDescription(destination.description || "");
            setAddress(destination.address || "");
            setLatitude(String(destination.latitude));
            setLongitude(String(destination.longitude));
            setQuery(destination.address || "");
        }
    }, [mode, destination]);

    // Address search with debounce
    useEffect(() => {
        if (query.trim().length < 3) {
            setPredictions([]);
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/places/autocomplete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ input: query }),
                });
                const data = await res.json();
                if (Array.isArray(data)) {
                    setPredictions(data);
                    setShowSuggestions(true);
                }
            } catch (err) {
                console.error('Autocomplete failed', err);
            } finally {
                setIsSearching(false);
            }
        }, 400);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query]);

    // Close suggestions on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Cleanup photo preview URL
    useEffect(() => {
        return () => {
            if (photoPreview) URL.revokeObjectURL(photoPreview);
        };
    }, [photoPreview]);

    const selectSuggestion = async (prediction: Prediction) => {
        setShowSuggestions(false);
        setQuery(prediction.description);
        setIsSearching(true); // show spinner while fetching details

        try {
            const res = await fetch(`/api/places/details?place_id=${prediction.place_id}`);
            const place = await res.json();

            if (place.error) {
                setError(place.error);
                return;
            }

            setName(place.name || prediction.structured_formatting?.main_text || prediction.description.split(',')[0]);
            setAddress(place.address);
            setLatitude(String(place.latitude));
            setLongitude(String(place.longitude));
            setError('');
        } catch (err) {
            setError('Could not fetch place details');
        } finally {
            setIsSearching(false);
        }
    };


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        } else {
            clearPhoto();
        }
    };

    const clearPhoto = () => {
        setPhotoFile(null);
        if (photoPreview) URL.revokeObjectURL(photoPreview);
        setPhotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!user) {
            navigate("/login?redirect=/dashboard");
            return;
        }
        setError("");
        if (!name || !latitude || !longitude) {
            setError("Name and location are required. Please search for an address.");
            return;
        }
        setLoading(true);
        try {
            if (mode === "add") {
                const newDest = await addDestination({
                    name,
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    address: address || undefined,
                    description: description || undefined,
                });
                if (photoFile) {
                    const formData = new FormData();
                    formData.append("photo", photoFile);
                    formData.append("caption", "");
                    await addPhoto(newDest.id, formData);
                }
            } else if (mode === "edit" && destination) {
                await editDestination(destination.id, {
                    name,
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    address: address || undefined,
                    description: description || undefined,
                });
            }
            fetchDestinations();
            onClose();
        } catch (error: any) {
            setError(error.message || "Failed to save destination");
        } finally {
            setLoading(false);
        }
    };

    const isAdd = mode === "add";
    const title = isAdd ? "Add Destination" : "Edit Destination";
    const buttonText = loading
        ? isAdd
            ? "Creating..."
            : "Saving..."
        : isAdd
            ? "Create Destination"
            : "Save Changes";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-2">
                    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mx-6 mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6">
                    {/* Address Search */}
                    <div ref={wrapperRef} className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() =>
                                    predictions.length > 0 && setShowSuggestions(true)
                                }
                                placeholder="Type a place name or address..."
                                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-800 placeholder-gray-400"
                            />
                            {isSearching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full" />
                                </div>
                            )}
                        </div>
                        {showSuggestions && predictions.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
                                {predictions.map((p) => (
                                    <li
                                        key={p.place_id}
                                        onClick={() => selectSuggestion(p)}
                                        className="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm"
                                    >
                                        <div className="font-medium">
                                            {p.structured_formatting?.main_text || p.description.split(',')[0]}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {p.structured_formatting?.secondary_text || p.description}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Destination Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-800 placeholder-gray-400"
                            placeholder="e.g., Marilaque Highway"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-800 placeholder-gray-400 resize-none"
                            placeholder="A short description of the place..."
                        />
                    </div>

                    {/* Coordinates & Full Address */}
                    {latitude && longitude && (
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Coordinates
                                </label>
                                <div className="px-4 py-3 bg-gray-100 rounded-xl text-sm text-gray-600 font-mono">
                                    {latitude}, {longitude}
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Address
                                </label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm text-gray-800 placeholder-gray-400"
                                    placeholder="Auto‑filled from selection"
                                />
                            </div>
                        </div>
                    )}

                    {/* Photo Upload (only add mode) */}
                    {isAdd && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Photo
                            </label>
                            {photoPreview ? (
                                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-2">
                                    <img
                                        src={photoPreview}
                                        alt="Preview"
                                        className="w-full h-40 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={clearPhoto}
                                        className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-indigo-300 transition-colors cursor-pointer group"
                                >
                                    <ImagePlus className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                    <span className="text-sm text-gray-500 group-hover:text-indigo-600">
                                        Click to upload a photo
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        JPEG, PNG up to 5MB
                                    </span>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !latitude || !longitude}
                            className="flex-1 px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {loading && (
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            )}
                            {buttonText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}