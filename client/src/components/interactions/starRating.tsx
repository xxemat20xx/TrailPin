import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { rateDestination } from '../../api/rating';

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
    const [selected, setSelected] = useState<number>(userRating ?? 0);
    const [average, setAverage] = useState(initialAverage);
    const [count, setCount] = useState(ratingsCount);

    // Sync when props change
    useEffect(() => {
        setSelected(userRating ?? 0);
        setAverage(initialAverage);
        setCount(ratingsCount);
    }, [userRating, initialAverage, ratingsCount]);

    const handleRate = async (score: number) => {
        if (!user) return;
        try {
            const res = await rateDestination(destinationId, { score });
            setSelected(score);
            setAverage(res.data.average);
            setCount(res.data.count);
        } catch (err) {
            // ignore
        }
    };

    // Determine how many stars to fill:
    // - If user has rated (selected > 0): fill `selected` stars
    // - Else if average exists: fill rounded average stars (to show the overall rating)
    const filledStars = selected > 0 ? selected : (average ? Math.round(average) : 0);

    const stars = [1, 2, 3, 4, 5];

    return (
        <div className="flex items-center gap-1">
            {stars.map((star) => (
                <button
                    key={star}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => user && setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    disabled={!user}
                    className={`${!user ? 'cursor-default' : ''}`}
                    title={user ? 'Rate this place' : 'Log in to rate'}
                >
                    <Star
                        className={`w-5 h-5 ${
                            // While hovering (and user logged in) show potential rating
                            user && hover >= star
                                ? 'text-yellow-400 fill-current'
                                : filledStars >= star
                                    ? 'text-yellow-400 fill-current'   // always fill based on filledStars
                                    : 'text-gray-300'
                            }`}
                    />
                </button>
            ))}
            {average !== null && (
                <span className="text-sm text-gray-600 ml-1">
                    {average.toFixed(1)} ({count})
                </span>
            )}
        </div>
    );
}