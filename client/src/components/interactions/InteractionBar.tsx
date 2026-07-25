import { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { likeDestination } from '../../api/destination';

interface Props {
    destinationId: string;
    initialLiked: boolean;
    initialLikeCount: number;
    commentCount: number;
    onCommentClick: () => void;
}

export default function InteractionBar({
    destinationId,
    initialLiked,
    initialLikeCount,
    commentCount,
    onCommentClick,
}: Props) {
    const { user } = useAuthStore();
    const [liked, setLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);

    const handleLike = async () => {
        if (!user) return;
        try {
            const res = await likeDestination(destinationId);
            setLiked(res.data.liked);
            setLikeCount(prev => (res.data.liked ? prev + 1 : prev - 1));
        } catch (err) {
            // keep old state
        }
    };

    return (
        <div className="flex items-center gap-4 mt-4">
            <button
                onClick={handleLike}
                className={`flex items-center gap-1 text-sm ${liked ? 'text-red-500' : 'text-gray-500'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!user}
                title={user ? (liked ? 'Unlike' : 'Like') : 'Log in to like'}
            >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                {likeCount}
            </button>
            <button
                onClick={onCommentClick}
                className="flex items-center gap-1 text-sm text-gray-500"
            >
                <MessageCircle className="w-4 h-4" />
                {commentCount}
            </button>
        </div>
    );
}