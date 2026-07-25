import type { Destination } from "../../api/destination";
import InteractionBar from "../interactions/InteractionBar";
import StarRating from "../interactions/starRating";
import { useState } from "react";

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
    const [commentDestId, setCommentDestId] = useState<string | null>(null);

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

                            {/* Star Rating */}
                            <div className="mt-4">
                                <StarRating
                                    destinationId={ride.id}
                                    initialAverage={ride.averageRating ?? null}
                                    initialCount={ride.likeCount} // or you may have a separate `totalRatings` field; adjust accordingly
                                />
                            </div>

                            <p className="text-orange-500 font-semibold mt-2">
                                <em className="text-slate-600">
                                    Shared by {ride.user?.name ?? "Unknown rider"}
                                </em>
                            </p>

                            {/* Interaction bar (likes / comments) */}
                            <InteractionBar
                                destinationId={ride.id}
                                initialLiked={ride.userLiked ?? false}
                                initialLikeCount={ride.likeCount}
                                commentCount={ride.commentCount}
                                onCommentClick={() =>
                                    setCommentDestId(
                                        ride.id === commentDestId ? null : ride.id
                                    )
                                }
                            />

                            {/* Optional: show comment section when selected */}
                            {commentDestId === ride.id && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                                    {/* You can place a CommentSection component here */}
                                    <p className="text-sm text-gray-500">Comments coming soon</p>
                                </div>
                            )}

                            <button className="mt-8 bg-orange-400 hover:bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold transition">
                                View Full Route
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}