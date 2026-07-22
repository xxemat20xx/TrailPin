import { useState } from 'react';
import { updateDestination } from '../../api/destination';   // authenticated PUT
import type { Destination } from '../../api/destination';
import { X } from 'lucide-react';

interface Props {
    destination: Destination;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditDestinationModal({ destination, onClose, onSuccess }: Props) {
    const [name, setName] = useState(destination.name);
    const [address, setAddress] = useState(destination.address || '');
    const [latitude, setLatitude] = useState(String(destination.latitude));
    const [longitude, setLongitude] = useState(String(destination.longitude));
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await updateDestination(destination.id, {
                name,
                address: address || undefined,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Edit Destination</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                            className="w-full border rounded px-3 py-2" />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-sm font-medium">Latitude</label>
                            <input type="number" step="any" value={latitude}
                                onChange={(e) => setLatitude(e.target.value)} required
                                className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium">Longitude</label>
                            <input type="number" step="any" value={longitude}
                                onChange={(e) => setLongitude(e.target.value)} required
                                className="w-full border rounded px-3 py-2" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Address</label>
                        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                            className="w-full border rounded px-3 py-2" />
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50 transition">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}