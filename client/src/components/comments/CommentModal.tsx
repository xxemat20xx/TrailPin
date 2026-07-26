import { useState, useEffect } from 'react';
import { X, Send, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import {
    getComments,
    addComment,
    deleteComment,
} from '../../api/destination';

interface Comment {
    id: string;
    text: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        avatar?: string;
    };
    canDelete: boolean;
}

interface Props {
    destinationId: string;
    destinationName: string;
    destinationImage?: string;
    onClose: () => void;
}

export default function CommentModal({
    destinationId,
    destinationName,
    destinationImage,
    onClose,
}: Props) {
    const { user } = useAuthStore();

    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchComments = async () => {
        try {
            const res = await getComments(destinationId);
            setComments(res.data);
        } catch (err) {
            setError('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [destinationId]);

    const handleAddComment = async () => {
        if (!newComment.trim() || !user) return;

        setSubmitting(true);

        try {
            const res = await addComment(destinationId, newComment.trim());

            setComments((prev) => [res.data, ...prev]);
            setNewComment('');
        } catch (err) {
            setError('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await deleteComment(destinationId, commentId);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
        } catch (err) {
            setError('Failed to delete comment');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b2a2a]/80 backdrop-blur-md p-4">
            <div className="w-full max-w-2xl h-[90vh] overflow-hidden rounded-[28px] bg-[#f5f2f2] shadow-[0_30px_80px_rgba(0,0,0,0.35)] flex flex-col animate-in fade-in zoom-in-95 duration-200">

                {/* HERO */}

                <div className="relative h-56 flex-shrink-0 overflow-hidden">

                    {destinationImage ? (
                        <img
                            src={destinationImage}
                            alt={destinationName}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#5a7acd] to-[#2b2a2a]" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#2b2a2a] via-[#2b2a2a]/40 to-transparent" />

                    <button
                        onClick={onClose}
                        className="absolute right-5 top-5 h-11 w-11 rounded-full bg-white/20 backdrop-blur-lg text-white transition hover:bg-white/30"
                    >
                        <X className="mx-auto h-5 w-5" />
                    </button>

                    <div className="absolute bottom-6 left-6">

                        <div className="inline-flex rounded-full bg-[#feb05d] px-3 py-1 text-xs font-semibold text-[#2b2a2a] shadow">
                            Travel Discussion
                        </div>

                        <h2 className="mt-3 text-3xl font-bold text-white">
                            {destinationName}
                        </h2>

                        <p className="mt-1 text-white/80">
                            {comments.length} Comment
                            {comments.length !== 1 && 's'}
                        </p>

                    </div>

                </div>

                {/* COMMENTS */}

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

                    {loading ? (

                        <div className="py-16 text-center">

                            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#5a7acd] border-t-transparent" />

                            <p className="text-[#2b2a2a] font-medium">
                                Loading comments...
                            </p>

                        </div>

                    ) : comments.length === 0 ? (

                        <div className="flex h-full flex-col items-center justify-center text-center py-20">

                            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#5a7acd]/10 text-5xl">
                                💬
                            </div>

                            <h3 className="text-2xl font-bold text-[#2b2a2a]">
                                No comments yet
                            </h3>

                            <p className="mt-2 max-w-sm text-gray-500">
                                Be the first traveler to share your experience,
                                tips, or favorite memories from this destination.
                            </p>

                        </div>

                    ) : (

                        comments.map((comment) => (

                            <div
                                key={comment.id}
                                className="group rounded-3xl bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >

                                <div className="flex gap-4">

                                    {/* Avatar */}

                                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-[#5a7acd]/20">

                                        {comment.user.avatar ? (

                                            <img
                                                src={comment.user.avatar}
                                                alt={comment.user.name}
                                                className="h-full w-full object-cover"
                                            />

                                        ) : (

                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#5a7acd] to-[#feb05d] text-lg font-bold text-white">

                                                {comment.user.name
                                                    ?.charAt(0)
                                                    .toUpperCase()}

                                            </div>

                                        )}

                                    </div>

                                    {/* Content */}

                                    <div className="flex-1">

                                        <div className="flex items-start justify-between">

                                            <div>

                                                <h4 className="font-semibold text-[#2b2a2a]">
                                                    {comment.user.name}
                                                </h4>

                                                <p className="mt-1 text-xs text-gray-400">
                                                    {formatDate(
                                                        comment.createdAt
                                                    )}
                                                </p>

                                            </div>

                                            {comment.canDelete && (
                                                <button
                                                    onClick={() =>
                                                        handleDeleteComment(
                                                            comment.id
                                                        )
                                                    }
                                                    className="opacity-0 group-hover:opacity-100 transition rounded-full p-2 text-red-400 hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}

                                        </div>

                                        <p className="mt-4 leading-7 text-[#2b2a2a] whitespace-pre-wrap">
                                            {comment.text}
                                        </p>

                                    </div>

                                </div>

                            </div>

                        ))

                    )}

                </div>

                {/* Sticky Input Area */}
                {user ? (
                    <div className="sticky bottom-0 border-t border-gray-200 bg-[#f5f2f2]/95 backdrop-blur-xl px-6 py-5">

                        {error && (
                            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <div className="flex items-end gap-3">

                            {/* User Avatar */}

                            <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-[#5a7acd]/20">

                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#5a7acd] to-[#feb05d] font-semibold text-white">
                                        {user.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                )}

                            </div>

                            {/* Input */}

                            <div className="flex flex-1 items-center rounded-full bg-white px-2 py-2 shadow-lg ring-1 ring-gray-200 transition focus-within:ring-2 focus-within:ring-[#5a7acd]">

                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) =>
                                        setNewComment(e.target.value)
                                    }
                                    placeholder="Share your travel experience..."
                                    className="flex-1 bg-transparent px-4 py-2 text-[#2b2a2a] placeholder:text-gray-400 outline-none"
                                    disabled={submitting}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' &&
                                        handleAddComment()
                                    }
                                />

                                <button
                                    onClick={handleAddComment}
                                    disabled={
                                        !newComment.trim() || submitting
                                    }
                                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5a7acd] text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-[#4868be] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Send className="h-5 w-5" />
                                </button>

                            </div>

                        </div>

                    </div>
                ) : (
                    <div className="border-t border-gray-200 bg-white px-6 py-8 text-center">

                        <div className="mx-auto max-w-sm">

                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#5a7acd]/10 text-3xl">
                                💬
                            </div>

                            <h3 className="text-lg font-semibold text-[#2b2a2a]">
                                Join the conversation
                            </h3>

                            <p className="mt-2 text-sm text-gray-500">
                                Sign in to share your experience, ask
                                questions, and connect with other travelers.
                            </p>

                            <button
                                onClick={() => {
                                    // Navigate to login page
                                }}
                                className="mt-5 rounded-full bg-[#5a7acd] px-6 py-3 font-medium text-white transition hover:bg-[#4868be]"
                            >
                                Log In
                            </button>

                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}