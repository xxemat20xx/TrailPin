import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getPublicDestinations } from '../api/publicDestinations';
import type { Destination } from '../api/destination';

import DestinationCard from '../components/destination/DestinationCard';
import AddDestinationModal from '../components/destination/AddDestinationModal';
import EditDestinationModal from '../components/destination/EditDestinationModal';
import DeleteDestinationModal from '../components/destination/DeleteDestinationModal';

import {
    Plus,
    MapPin,
    Compass,
    Search,
    Filter,
} from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [filtered, setFiltered] = useState<Destination[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
    const [deletingDestination, setDeletingDestination] = useState<Destination | null>(null);

    const fetchDestinations = async () => {
        try {
            const res = await getPublicDestinations();
            setDestinations(res.data);
            setFiltered(res.data);
        } catch (err) {
            console.error('Failed to load destinations', err);
        }
    };

    useEffect(() => {
        fetchDestinations();
    }, []);

    // Search filter
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFiltered(destinations);
            return;
        }
        const q = searchQuery.toLowerCase();
        setFiltered(
            destinations.filter(
                (d) =>
                    d.name.toLowerCase().includes(q) ||
                    (d.address && d.address.toLowerCase().includes(q))
            )
        );
    }, [searchQuery, destinations]);

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
    const handleEditSuccess = () => {
        setEditingDestination(null);
        fetchDestinations();
    };
    const handleDeleteSuccess = () => {
        setDeletingDestination(null);
        fetchDestinations();
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* ========== HERO (more compact & modern) ========== */}
            <section className="relative bg-gradient-to-r from-indigo-600 to-blue-700 overflow-hidden">
                {/* Decorative background shapes */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-400 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-16">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="text-white">
                            <div className="flex items-center gap-2 mb-3">
                                <Compass className="w-8 h-8" />
                                <span className="text-sm uppercase tracking-widest font-semibold opacity-80">
                                    TrailPin
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                                Wanderlust Journal
                            </h1>
                            <p className="mt-2 text-indigo-100 max-w-lg">
                                Discover, save, and share your favorite riding destinations.
                            </p>
                        </div>

                        <button
                            onClick={handleAddClick}
                            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-transform"
                        >
                            <Plus className="w-5 h-5" />
                            Add Destination
                        </button>
                    </div>
                </div>
            </section>

            {/* ========== SEARCH BAR ========== */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search destinations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                </div>
            </div>

            {/* ========== CARD GRID ========== */}
            <section className="max-w-7xl mx-auto px-6 pb-20">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                        <MapPin className="w-16 h-16 mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
                            No destinations found
                        </h2>
                        <p className="mt-2 text-gray-500">
                            {destinations.length === 0
                                ? 'Start your journey by adding the first destination.'
                                : 'Try a different search term.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map((dest, idx) => (
                            <div
                                key={dest.id}
                                className="opacity-0 animate-fadeInUp"
                                style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'forwards' }}
                            >
                                <DestinationCard
                                    destination={dest}
                                    onEdit={setEditingDestination}
                                    onDelete={setDeletingDestination}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ========== FLOATING ADD BUTTON (Mobile) ========== */}
            <button
                onClick={handleAddClick}
                className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-indigo-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform md:hidden"
            >
                <Plus className="w-6 h-6" />
            </button>

            {/* ========== MODALS ========== */}
            {showAddModal && (
                <AddDestinationModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleAddSuccess}
                />
            )}
            {editingDestination && (
                <EditDestinationModal
                    destination={editingDestination}
                    onClose={() => setEditingDestination(null)}
                    onSuccess={handleEditSuccess}
                />
            )}
            {deletingDestination && (
                <DeleteDestinationModal
                    destinationId={deletingDestination.id}
                    destinationName={deletingDestination.name}
                    onClose={() => setDeletingDestination(null)}
                    onSuccess={handleDeleteSuccess}
                />
            )}
        </div>
    );
}