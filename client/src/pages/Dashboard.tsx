import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getPublicDestinations } from '../api/publicDestinations';
import type { Destination } from '../api/destination';
import DestinationCard from '../components/destination/DestinationCard';
import AddDestinationModal from '../components/destination/AddDestinationModal';
import { Plus } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchDestinations = async () => {
        try {
            const res = await getPublicDestinations();
            setDestinations(res.data);
        } catch (err) {
            console.error('Failed to load destinations', err);
        }
    };

    useEffect(() => {
        fetchDestinations();
    }, []);

    const handleAddClick = () => {
        if (!user) {
            navigate('/login?redirect=/dashboard');
            return;
        }
        setShowAddModal(true);
    };

    const handleAddSuccess = () => {
        setShowAddModal(false);
        fetchDestinations();
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Explore Destinations</h1>
                <button
                    onClick={handleAddClick}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                    title={user ? 'Add a destination' : 'Log in to add'}
                >
                    <Plus className="w-5 h-5" />
                    Add Destination
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {destinations.map((dest: Destination) => (
                    <DestinationCard key={dest.id} destination={dest} />
                ))}
            </div>

            {showAddModal && (
                <AddDestinationModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleAddSuccess}
                />
            )}
        </div>
    );
}