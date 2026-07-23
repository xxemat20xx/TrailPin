import type { Destination } from "../../api/destination";
import { useAuthStore } from "../../stores/authStore";
import { useDestinationStore } from "../../stores/destinationStore";
import {
    Pen,
    Trash
} from 'lucide-react'
import { useState } from "react";
import DestinationFormModal from "../destination/DestinationFormModal";
interface Props {
    destinations: Destination[];
    searchQuery: string;
}

const getImageUrl = (dest: Destination) =>
    dest.photos?.[0]?.url ||
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200';

export default function DashboardCommunityCard({ destinations, searchQuery }: Props) {
    const { user } = useAuthStore();
    const { removeDestination } = useDestinationStore();
    const [openModal, setOpenModal] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
    const filtered = destinations.filter(d => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            d.name.toLowerCase().includes(q) ||
            (d.address && d.address.toLowerCase().includes(q))
        );
    });
    const handleDelete = async (id: string) => {
        if (!user) return;
        removeDestination(id)
    }
    const openEditModal = (ride: Destination) => {
        if (!user) return;
        setSelectedDestination(ride);
        setOpenModal(true)
    }
    return (
        <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8">🏍 Community Rides</h2>

            <div className="space-y-12">
                {filtered.map((ride, index) => (
                    <div
                        key={ride.id}
                        className={`grid lg:grid-cols-2 gap-10 items-center ${index % 2 !== 0 ? "lg:[&>*:first-child]:order-2" : ""
                            }`}
                    >
                        <img
                            src={getImageUrl(ride)}
                            className="rounded-3xl h-96 w-full object-cover shadow-lg"
                            alt={ride.name}
                        />
                        <div>
                            <h2 className="text-5xl font-black mt-2">{ride.name}</h2>
                            <p className="text-gray-600 mt-6 leading-8">{ride.address}</p>
                            <p className="text-gray-600 mt-6 leading-8">{ride.description}</p>
                            <p className="text-orange-500 font-semibold">
                                <em className="text-slate-600">Shared by {ride.user?.name}</em>
                            </p>
                            <button className="mt-8 bg-orange-400 hover:bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold transition">
                                View Full Route
                            </button>
                            <button
                                onClick={() => handleDelete(ride.id)}
                                className="mt-8 bg-orange-400 hover:bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold transition ml-3">
                                <Trash />
                            </button>
                            <button
                                onClick={() => openEditModal(ride)}
                                className="mt-8 bg-orange-400 hover:bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold transition ml-3">
                                <Pen />
                            </button>
                        </div>
                    </div>

                ))}
                {openModal && (
                    <DestinationFormModal
                        mode="edit"
                        destination={selectedDestination}
                        onClose={() => setOpenModal(false)}
                    />
                )}
            </div>
        </div>
    );
}