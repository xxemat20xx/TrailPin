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
} from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingDestination, setEditingDestination] =
        useState<Destination | null>(null);
    const [deletingDestination, setDeletingDestination] =
        useState<Destination | null>(null);

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

    const handleEditSuccess = () => {
        setEditingDestination(null);
        fetchDestinations();
    };

    const handleDeleteSuccess = () => {
        setDeletingDestination(null);
        fetchDestinations();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">

            {/* HERO */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 opacity-95" />

                <div className="relative max-w-7xl mx-auto px-6 py-20 text-white">

                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">

                        <div>

                            <div className="flex items-center gap-3 mb-4">
                                <Compass className="w-10 h-10" />
                                <span className="uppercase tracking-[0.35em] text-sm font-semibold opacity-90">
                                    Travel Journal
                                </span>
                            </div>

                            <h1 className="text-5xl font-black mb-4">
                                Explore Destinations
                            </h1>

                            <p className="max-w-xl text-lg text-indigo-100">
                                Every destination tells a story. Scroll through
                                your journey one place at a time.
                            </p>

                        </div>

                        <button
                            onClick={handleAddClick}
                            title={
                                user
                                    ? 'Add Destination'
                                    : 'Login to Add Destination'
                            }
                            className="group flex items-center gap-3 rounded-full bg-white px-7 py-4 font-semibold text-indigo-700 shadow-2xl transition hover:scale-105 hover:shadow-white/20"
                        >
                            <Plus className="w-5 h-5 transition group-hover:rotate-90" />
                            Add Destination
                        </button>

                    </div>
                </div>
            </section>

            {/* TIMELINE */}
            <section className="max-w-6xl mx-auto px-6 py-16">

                {destinations.length === 0 ? (
                    <div className="text-center py-24">

                        <MapPin className="w-14 h-14 mx-auto text-indigo-400 mb-5" />

                        <h2 className="text-2xl font-bold mb-2">
                            No destinations yet
                        </h2>

                        <p className="text-gray-500">
                            Start your travel journey by adding your first
                            destination.
                        </p>

                    </div>
                ) : (

                    <div className="relative">

                        {/* vertical line */}
                        <div className="absolute left-6 top-0 bottom-0 w-[3px] bg-gradient-to-b from-indigo-500 via-cyan-400 to-indigo-300 rounded-full" />

                        <div className="space-y-16">

                            {destinations.map((dest, index) => (

                                <div
                                    key={dest.id}
                                    className="relative flex gap-8 items-start"
                                >
                                    {/* Timeline Dot */}

                                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-cyan-500 shadow-lg ring-8 ring-white dark:ring-slate-900">

                                        <span className="text-white font-bold">
                                            {index + 1}
                                        </span>

                                    </div>

                                    {/* Card */}

                                    <div className="flex-1 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition duration-300 hover:-translate-y-1 p-2">

                                        <DestinationCard
                                            destination={dest}
                                            onEdit={setEditingDestination}
                                            onDelete={setDeletingDestination}
                                        />

                                    </div>
                                </div>

                            ))}

                        </div>
                    </div>

                )}
            </section>

            {/* Floating Add Button (Mobile) */}

            <button
                onClick={handleAddClick}
                className="fixed bottom-8 right-8 md:hidden h-16 w-16 rounded-full bg-indigo-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition"
            >
                <Plus className="w-7 h-7" />
            </button>

            {/* Modals */}

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