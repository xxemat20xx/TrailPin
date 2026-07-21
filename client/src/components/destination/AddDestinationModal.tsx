import { useState } from 'react';
import { createDestination, addPhoto } from '../../api/destination';
import { X, Upload } from 'lucide-react';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddDestinationModal({ onClose, onSuccess }: Props) {
    const [name, setName] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [address, setAddress] = useState('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await createDestination({
                name,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                address: address || undefined,
            });
            const destinationId = res.data.id;

            // Upload photo if selected
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
                    <div>
                        <label className="block text-sm font-medium">Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-sm font-medium">Latitude *</label>
                            <input
                                type="number"
                                step="any"
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value)}
                                required
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium">Longitude *</label>
                            <input
                                type="number"
                                step="any"
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                                required
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Address</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Photo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                        {loading ? 'Creating...' : 'Create Destination'}
                    </button>
                </form>
            </div>
        </div>
    );
}