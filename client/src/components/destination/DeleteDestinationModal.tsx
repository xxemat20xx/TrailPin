import { useState } from 'react';
import { deleteDestination } from '../../api/destination';
import { X, AlertTriangle } from 'lucide-react';

interface Props {
    destinationId: string;
    destinationName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function DeleteDestinationModal({ destinationId, destinationName, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        setLoading(true);
        setError('');
        try {
            await deleteDestination(destinationId);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Deletion failed');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Delete Destination
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-gray-600 mb-4">
                    Are you sure you want to delete <strong>{destinationName}</strong>? This will also remove all its photos. This action cannot be undone.
                </p>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 transition">
                        Cancel
                    </button>
                    <button onClick={handleDelete} disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition">
                        {loading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}