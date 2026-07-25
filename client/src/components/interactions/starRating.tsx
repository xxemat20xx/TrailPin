import { Star } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { rateDestination } from '../../api/rating';
import { useState } from 'react';

interface Props {
    destinationId: string;
    initialAverage: number | null;
    initialCount: number;
}

export default function StarRating({ destinationId, initialAverage, initialCount }: Props) {
    const { user } = useAuthStore();
    const [hover, setHover] = useState(0);
    const [selected, setSelected] = useState(0); // user's own rating
    const [average, setAverage] = useState(initialAverage);
    const [count, setCount] = useState(initialCount);

    const handleRate = async (score: number) => {
        if (!user) return;
        try {
            const res = await rateDestination(destinationId, { score });
            setSelected(score);
            setAverage(res.data.average);
            setCount(res.data.count);
        } catch (err) {
            // rollback
        }
    };

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
                    className={`${!user ? 'cursor-not-allowed opacity-60' : ''}`}
                    title={user ? 'Rate this place' : 'Log in to rate'}
                >
                    <Star
                        className={`w-5 h-5 ${(hover || selected) >= star
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                            }`}
                    />
                </button>
            ))}
            {average && (
                <span className="text-sm text-gray-600 ml-1">
                    {average.toFixed(1)} ({count})
                </span>
            )}
        </div>
    );
}