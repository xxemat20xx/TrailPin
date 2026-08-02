import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronUp,
  ChevronDown,
  Clock,
  Navigation,
  Star,
  MessageSquare,
  Bookmark,
  Share2,
  MapPin,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuthStore } from '../../stores/authStore';
import { likeItinerary } from '../../api/itinerary';

interface ItineraryCardProps {
  itinerary: any; // Replace with your Itinerary type
}

const getCoverPhoto = (itinerary: any) =>
  itinerary.coverPhoto ||
  itinerary.stops?.[0]?.photos?.[0]?.url ||
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200';

const difficultyColor = (difficulty?: string) => {
  switch (difficulty) {
    case 'Easy':   return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'Medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'Hard':   return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'Expert': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    default:       return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  }
};

export default function ItineraryCard({ itinerary }: ItineraryCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [liked, setLiked] = useState(itinerary.userLiked ?? false);
  const [likeCount, setLikeCount] = useState(itinerary.likeCount ?? 0);
  const [isSaved, setIsSaved] = useState(false); // placeholder for future save feature

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      const res = await likeItinerary(itinerary.id);
      const newLiked = res.data.liked;
      setLiked(newLiked);
      setLikeCount((prev: number) => (newLiked ? prev + 1 : prev - 1));
      if (newLiked) {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.8 },
          colors: ['#f97316', '#fb923c', '#ea580c'],
        });
      }
    } catch (err) {
      // ignore
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/itineraries/${itinerary.id}`;
    navigator.clipboard.writeText(url).then(() => alert('Link copied!'));
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    // TODO: call save itinerary API
  };

  return (
    <div
      onClick={() => navigate(`/itineraries/${itinerary.id}`)}
      className="bg-white rounded-2xl border border-gray-200 hover:border-orange-400/50 shadow-lg hover:shadow-2xl hover:shadow-orange-100/50 transition-all duration-300 group cursor-pointer flex flex-col sm:flex-row overflow-hidden"
    >
      {/* Upvote sidebar (desktop) */}
      <div className="hidden sm:flex flex-col items-center justify-start p-3 bg-gray-50 border-r border-gray-200 w-14">
        <button
          type="button"
          onClick={handleLike}
          className={`p-1.5 rounded-lg transition ${
            liked
              ? 'bg-orange-500 text-white font-black scale-110'
              : 'text-gray-400 hover:text-orange-500 hover:bg-gray-100'
          }`}
          title="Like this itinerary"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        <span className={`text-xs font-black my-1 font-mono ${liked ? 'text-orange-500' : 'text-gray-600'}`}>
          {likeCount}
        </span>

        <button
          type="button"
          className="p-1.5 rounded-lg text-gray-300 hover:text-gray-400 cursor-default"
          disabled
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Cover photo banner */}
        <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-900">
          <img
            src={getCoverPhoto(itinerary)}
            alt={itinerary.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {itinerary.difficulty && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border backdrop-blur-md ${difficultyColor(itinerary.difficulty)}`}
              >
                {itinerary.difficulty}
              </span>
            )}
            <span className="bg-black/70 backdrop-blur-md border border-white/20 text-orange-300 px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              {itinerary.stops?.length ?? 0} Stops
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <button
              type="button"
              onClick={handleSave}
              className={`p-2 rounded-xl border backdrop-blur-md transition ${
                isSaved
                  ? 'bg-orange-500 text-white border-orange-400 shadow-lg'
                  : 'bg-black/70 border-white/20 text-gray-200 hover:text-orange-400 hover:bg-black/80'
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Bottom stats overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-3">
              {itinerary.totalDistance && (
                <span className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 font-mono font-bold">
                  <Navigation className="w-3.5 h-3.5 text-orange-400" />
                  {itinerary.totalDistance.toFixed(1)} km
                </span>
              )}
              {itinerary.estimatedTime && (
                <span className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 font-mono font-bold">
                  <Clock className="w-3.5 h-3.5 text-orange-400" />
                  {itinerary.estimatedTime}
                </span>
              )}
            </div>
            {itinerary.averageRating > 0 && (
              <div className="flex items-center gap-1 bg-orange-500/20 backdrop-blur-md border border-orange-400/40 px-2.5 py-1 rounded-lg text-orange-300 font-bold">
                <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                {itinerary.averageRating.toFixed(1)}
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Author row */}
            <div className="flex items-center justify-between mb-2 text-xs">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  // navigate to user profile if available
                }}
                className="flex items-center gap-2 group/author text-left"
              >
                <img
                  src={itinerary.user?.avatar || 'https://via.placeholder.com/24'}
                  alt={itinerary.user?.name}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-orange-400/40"
                />
                <span className="font-bold text-gray-700 group-hover/author:text-orange-600 transition">
                  {itinerary.user?.name || 'Unknown Rider'}
                </span>
              </button>
              <span className="text-gray-400 text-[11px] font-mono">
                {new Date(itinerary.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-black text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1 mb-1.5">
              {itinerary.name}
            </h3>

            {/* Description */}
            {itinerary.description && (
              <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                {itinerary.description}
              </p>
            )}

            {/* Tags */}
            {itinerary.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {itinerary.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-md border border-gray-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer bar */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-400">
            {/* Mobile upvote */}
            <div className="flex sm:hidden items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={handleLike}
                className={`p-1 rounded ${liked ? 'text-orange-500 font-bold' : 'text-gray-400'}`}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <span className="font-mono font-bold text-gray-700 px-1">{likeCount}</span>
              <button className="p-1 rounded text-gray-300 cursor-default" disabled>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 hover:text-gray-600 transition">
                <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                {itinerary.commentCount ?? 0} Comments
              </span>
              <span className="flex items-center gap-1 hover:text-gray-600 transition">
                <Star className="w-3.5 h-3.5 text-orange-400" />
                {itinerary.ratingCount ?? 0} Reviews
              </span>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-gray-100 transition"
              title="Share Route"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}