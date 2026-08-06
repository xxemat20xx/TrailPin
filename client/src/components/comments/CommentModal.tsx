import { useState, useEffect } from 'react';
import { X, Send, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { getComments, addComment, deleteComment } from '../../api/itinerary';

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
  itineraryId: string;
  itineraryName: string;
  onClose: () => void;
}

export default function CommentModal({ itineraryId, itineraryName, onClose }: Props) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchComments = async () => {
    try {
      const res = await getComments(itineraryId);
      setComments(res.data);
    } catch (err) {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [itineraryId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;
    setSubmitting(true);
    try {
      const res = await addComment(itineraryId, newComment.trim());
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
      await deleteComment(itineraryId, commentId);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold">{itineraryName}</h2>
            <p className="text-sm text-gray-500">Comments</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <p className="text-center text-gray-500">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-center text-gray-500">No comments yet. Be the first!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                  {comment.user.avatar ? (
                    <img src={comment.user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-bold">
                      {comment.user.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{comment.user.name}</span>
                    <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-gray-800 mt-1">{comment.text}</p>
                </div>
                {comment.canDelete && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-400 hover:text-red-600"
                    title="Delete comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Input area (if logged in) */}
        {user ? (
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:border-indigo-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                disabled={submitting}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || submitting}
                className="p-2 bg-indigo-600 text-white rounded-full disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400 p-4 border-t">
            <button onClick={() => {}} className="text-indigo-600 hover:underline">
              Log in
            </button>{' '}
            to leave a comment.
          </p>
        )}
      </div>
    </div>
  );
}