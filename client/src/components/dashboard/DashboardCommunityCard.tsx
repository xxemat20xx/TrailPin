import { useState } from "react";
import type { Destination } from "../../api/destination";

import StarRating from "../interactions/starRating";
import DestinationFormModal from "../destination/DestinationFormModal";
import { useAuthStore } from "../../stores/authStore";
import { useDestinationStore } from "../../stores/destinationStore";
import { Pen, Trash2 } from "lucide-react";


interface Props {
    destinations: Destination[];
    searchQuery: string;
}

const getImageUrl = (dest: Destination) =>
    dest.photos?.[0]?.url ||
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200";

export default function DashboardCommunityCard({
    destinations,
    searchQuery,
}: Props) {
    const { user } = useAuthStore();
    const { removeDestination } = useDestinationStore();


    const [editDestination, setEditDestination] = useState<Destination | null>(
        null
    );
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
    const handleDelete = async (id: string) => {
        if (!user) return;
        try {
            await removeDestination(id);
            // Optional: show success toast
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    const filtered = destinations.filter((d) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            d.name.toLowerCase().includes(q) ||
            (d.address && d.address.toLowerCase().includes(q))
        );
    });

    return (
        <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8">🏍 Community Rides</h2>
            <div className="space-y-12">
                {filtered.map((ride, index) => {
                    const isOwner = user?.id === ride.userId;

                    return (
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
                                <p className="text-gray-600 mt-4">{ride.description}</p>

                                {/* Star Rating */}
                                <div className="mt-4">
                                    <StarRating
                                        destinationId={ride.id}
                                        initialAverage={ride.averageRating ?? null}
                                        ratingsCount={ride.ratingsCount ?? 0}
                                        userRating={ride.userRating ?? null}
                                    />
                                </div>

                                <p className="text-orange-500 font-semibold mt-2">
                                    <em className="text-slate-600">
                                        Shared by {ride.user?.name ?? "Unknown rider"}
                                    </em>
                                </p>

                            

                           
                                <button className="mt-8 bg-orange-400 hover:bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold transition">
                                    View Full Route
                                </button>

                                {/* Owner actions */}
                                {isOwner && (
                                    <div className="flex space-x-2 mt-4">
                                        <button
                                            onClick={() => {
                                                setEditDestination(ride);
                                                setIsEditModalOpen(true);
                                            }}
                                            className="flex items-center space-x-2 bg-white hover:bg-orange-50 text-orange-500 px-4 py-2 rounded-xl transition"
                                        >
                                            <Pen size={18} />

                                        </button>

                                        <button
                                            onClick={() => handleDelete(ride.id)}
                                            className="flex items-center space-x-2 bg-white hover:bg-red-50 text-red-500 px-4 py-2 rounded-xl transition"
                                        >
                                            <Trash2 size={18} />

                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Edit modal */}
            {isEditModalOpen && editDestination && (
                <DestinationFormModal
                    mode="edit"
                    destination={editDestination}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditDestination(null);
                    }}
                />
            )}
        </div>
    );
}