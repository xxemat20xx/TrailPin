import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { rateDestination } from "../../api/rating";

interface Props {
    destinationId: string;
    initialAverage: number | null;
    ratingsCount: number;
    userRating: number | null;
}

export default function StarRating({
    destinationId,
    initialAverage,
    ratingsCount,
    userRating,
}: Props) {
    const { user } = useAuthStore();

    const [hover, setHover] = useState(0);
    const [selected, setSelected] = useState(userRating ?? 0);
    const [average, setAverage] = useState(initialAverage);
    const [count, setCount] = useState(ratingsCount);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setSelected(userRating ?? 0);
        setAverage(initialAverage);
        setCount(ratingsCount);
    }, [userRating, initialAverage, ratingsCount]);

    const handleRate = async (score: number) => {
        if (!user || loading) return;

        try {
            setLoading(true);

            const res = await rateDestination(destinationId, { score });

            setSelected(score);
            setAverage(res.data.average);
            setCount(res.data.count);
        } finally {
            setLoading(false);
        }
    };

    const display = hover || selected || Math.round(average ?? 0);

    return (
        <div className="inline-flex items-center gap-3">
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        disabled={!user || loading}
                        onClick={() => handleRate(star)}
                        onMouseEnter={() => user && setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="group p-0.5 disabled:cursor-default"
                        title={user ? `Rate ${star}` : "Login to rate"}
                    >
                        <Star
                            className={`
                h-5 w-5 transition-all duration-200 ease-out
                ${display >= star
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-300"
                                }
                ${user
                                    ? "group-hover:scale-110"
                                    : ""
                                }
              `}
                        />
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-1 text-sm">
                {average !== null ? (
                    <>
                        <span className="font-medium text-gray-900">
                            {average.toFixed(1)}
                        </span>

                        <span className="text-gray-400">•</span>

                        <span className="text-gray-500">
                            {count} {count === 1 ? "rating" : "ratings"}
                        </span>

                        {selected > 0 && (
                            <>
                                <span className="text-gray-300">|</span>
                                <span className="text-emerald-600">
                                    You rated {selected}
                                </span>
                            </>
                        )}
                    </>
                ) : (
                    <span className="text-gray-500">
                        No ratings yet
                    </span>
                )}
            </div>
        </div>
    );
}