
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ChevronUp,
  Clock,
  Navigation,
  Star,
  MessageSquare,
  Bookmark,
  Share2,
  MapPin,

} from "lucide-react";

import confetti from "canvas-confetti";

import { useAuthStore } from "../../stores/authStore";
import { likeItinerary } from "../../api/itinerary";

interface ItineraryCardProps {
  itinerary: any;
}

// ============================================================
// HELPERS
// ============================================================

const getCoverPhoto = (
  itinerary: any
) =>
  itinerary.coverPhoto ||
  itinerary.stops?.[0]?.photos?.[0]?.url ||
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200";

const difficultyConfig = (
  difficulty?: string
) => {
  switch (difficulty) {
    case "Easy":
      return {
        label: "Easy",
        className:
          "bg-emerald-500/90 text-white",
      };

    case "Medium":
      return {
        label: "Medium",
        className:
          "bg-blue-500/90 text-white",
      };

    case "Hard":
      return {
        label: "Hard",
        className:
          "bg-orange-500/90 text-white",
      };

    case "Expert":
      return {
        label: "Expert",
        className:
          "bg-rose-500/90 text-white",
      };

    default:
      return {
        label:
          difficulty || "Unknown",
        className:
          "bg-gray-700/90 text-white",
      };
  }
};

const getInitials = (
  name?: string
) => {
  if (!name) return "?";

  const parts =
    name.trim().split(/\s+/);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return name
    .charAt(0)
    .toUpperCase();
};

// ============================================================
// COMPONENT
// ============================================================

export default function ItineraryCard({
  itinerary,
}: ItineraryCardProps) {
  const navigate = useNavigate();

  const { user } =
    useAuthStore();

  const [liked, setLiked] =
    useState(
      itinerary.userLiked ??
        false
    );

  const [likeCount, setLikeCount] =
    useState(
      itinerary.likeCount ?? 0
    );

  const [isSaved, setIsSaved] =
    useState(false);

  const [isSharing, setIsSharing] =
    useState(false);

  // ==========================================================
  // LIKE
  // ==========================================================

  const handleLike = async (
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (!user) {
      navigate(
        `/login?redirect=/itineraries/${itinerary.id}`
      );

      return;
    }

    try {
      const res =
        await likeItinerary(
          itinerary.id
        );

      const newLiked =
        res.data.liked;

      setLiked(newLiked);

      setLikeCount(
        (prev: number) =>
          newLiked
            ? prev + 1
            : Math.max(
                0,
                prev - 1
              )
      );

      if (newLiked) {
        confetti({
          particleCount: 22,
          spread: 35,
          startVelocity: 18,
          origin: {
            y: 0.75,
          },
          colors: [
            "#f97316",
            "#fb923c",
            "#ea580c",
          ],
        });
      }
    } catch (err) {
      console.error(
        "Failed to like itinerary:",
        err
      );
    }
  };

  // ==========================================================
  // SHARE
  // ==========================================================

  const handleShare = async (
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    const url = `${window.location.origin}/itineraries/${itinerary.id}`;

    try {
      setIsSharing(true);

      if (
        navigator.share
      ) {
        await navigator.share({
          title:
            itinerary.name,
          text:
            `Check out this motorcycle route: ${itinerary.name}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(
          url
        );

        alert(
          "Route link copied!"
        );
      }
    } catch (error) {
      // User cancelled native share.
      console.log(
        "Share cancelled:",
        error
      );
    } finally {
      setTimeout(() => {
        setIsSharing(false);
      }, 500);
    }
  };

  // ==========================================================
  // SAVE
  // ==========================================================

  const handleSave = (
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    setIsSaved(
      (prev) => !prev
    );

    // TODO:
    // Connect to save itinerary API.
  };

  // ==========================================================
  // OPEN COMMENTS
  // ==========================================================

  const handleComments = (
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    navigate(
      `/itineraries/${itinerary.id}#comments`
    );
  };

  // ==========================================================
  // AUTHOR
  // ==========================================================

  const authorName =
    itinerary.user?.name ||
    "Unknown Rider";

  const authorAvatar =
    itinerary.user?.avatar;

  // ==========================================================
  // DIFFICULTY
  // ==========================================================

  const difficulty =
    difficultyConfig(
      itinerary.difficulty
    );

  // ==========================================================
  // DATE
  // ==========================================================

  const formattedDate =
    itinerary.createdAt
      ? new Date(
          itinerary.createdAt
        ).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          }
        )
      : "";

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <article
      onClick={() =>
        navigate(
          `/itineraries/${itinerary.id}`
        )
      }
      className="
        group
        relative
        flex
        cursor-pointer
        flex-col
        overflow-hidden
        rounded-3xl
        border
        border-gray-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-orange-300
        hover:shadow-xl
        hover:shadow-orange-100/60
      "
    >
      {/* ====================================================
          IMAGE
      ==================================================== */}

      <div className="relative aspect-video w-full overflow-hidden bg-gray-900">
        <img
          src={getCoverPhoto(
            itinerary
          )}
          alt={
            itinerary.name
          }
          loading="lazy"
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-700
            group-hover:scale-105
          "
        />

        {/* Image gradient */}

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/10" />

        {/* ==================================================
            TOP LEFT BADGES
        ================================================== */}

        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          {itinerary.difficulty && (
            <span
              className={`
                rounded-lg
                px-2.5
                py-1
                text-[9px]
                font-black
                uppercase
                tracking-wider
                shadow-sm
                backdrop-blur
                ${difficulty.className}
              `}
            >
              {
                difficulty.label
              }
            </span>
          )}

          <span className="flex items-center gap-1 rounded-lg border border-white/20 bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
            <MapPin className="h-3 w-3 text-orange-400" />

            {itinerary.stops
              ?.length ?? 0}
          </span>
        </div>

        {/* ==================================================
            TOP RIGHT ACTIONS
        ================================================== */}

        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          <button
            type="button"
            onClick={
              handleSave
            }
            className={`
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-xl
              border
              backdrop-blur-md
              transition
              ${
                isSaved
                  ? "border-orange-400 bg-orange-500 text-white"
                  : "border-white/20 bg-black/60 text-white hover:bg-white hover:text-orange-500"
              }
            `}
            title={
              isSaved
                ? "Saved"
                : "Save route"
            }
          >
            <Bookmark
              className="h-3.5 w-3.5"
              fill={
                isSaved
                  ? "currentColor"
                  : "none"
              }
            />
          </button>

          <button
            type="button"
            onClick={
              handleShare
            }
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:bg-white hover:text-orange-500"
            title="Share route"
          >
            {isSharing ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Share2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* ==================================================
            IMAGE BOTTOM INFO
        ================================================== */}

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {itinerary.totalDistance >
              0 && (
              <span className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/60 px-2.5 py-1.5 text-[10px] font-bold text-white backdrop-blur-md">
                <Navigation className="h-3 w-3 text-orange-400" />

                {Number(
                  itinerary.totalDistance
                ).toFixed(1)}{" "}
                km
              </span>
            )}

            {itinerary.estimatedTime && (
              <span className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/60 px-2.5 py-1.5 text-[10px] font-bold text-white backdrop-blur-md">
                <Clock className="h-3 w-3 text-orange-400" />

                {
                  itinerary.estimatedTime
                }
              </span>
            )}
          </div>

          {itinerary.averageRating >
            0 && (
            <div className="flex shrink-0 items-center gap-1 rounded-lg border border-orange-300/30 bg-orange-500/20 px-2.5 py-1.5 text-[10px] font-black text-orange-200 backdrop-blur-md">
              <Star
                className="h-3 w-3 fill-orange-400 text-orange-400"
              />

              {Number(
                itinerary.averageRating
              ).toFixed(1)}
            </div>
          )}
        </div>
      </div>

      {/* ====================================================
          CONTENT
      ==================================================== */}

      <div className="flex flex-1 flex-col p-4">
        {/* ==================================================
            AUTHOR
        ================================================== */}

        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {authorAvatar ? (
              <img
                src={
                  authorAvatar
                }
                alt={
                  authorName
                }
                className="h-7 w-7 shrink-0 rounded-full object-cover ring-2 ring-orange-100"
              />
            ) : (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#242222] text-[10px] font-black text-white ring-2 ring-orange-100">
                {getInitials(
                  authorName
                )}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold text-gray-700">
                {authorName}
              </p>

              {formattedDate && (
                <p className="text-[9px] text-gray-400">
                  {formattedDate}
                </p>
              )}
            </div>
          </div>

      
        </div>

        {/* ==================================================
            TITLE
        ================================================== */}

        <h3 className="line-clamp-1 text-[17px] font-black tracking-tight text-[#242222] transition-colors group-hover:text-orange-500">
          {itinerary.name}
        </h3>

        {/* ==================================================
            DESCRIPTION
        ================================================== */}

        {itinerary.description && (
          <p className="mt-1.5 line-clamp-2 text-[11px] leading-5 text-gray-500">
            {
              itinerary.description
            }
          </p>
        )}

        {/* ==================================================
            TAGS
        ================================================== */}

        {itinerary.tags?.length >
          0 && (
          <div className="mt-3 flex min-h-5.5 items-center gap-1.5 overflow-hidden">
            {itinerary.tags
              .slice(0, 3)
              .map(
                (
                  tag: string
                ) => (
                  <span
                    key={tag}
                    className="shrink-0 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] font-semibold text-gray-500"
                  >
                    #{tag}
                  </span>
                )
              )}

            {itinerary.tags
              .length > 3 && (
              <span className="text-[9px] font-bold text-gray-400">
                +
                {itinerary
                  .tags
                  .length -
                  3}
              </span>
            )}
          </div>
        )}

        {/* ==================================================
            SPACER
        ================================================== */}

        <div className="flex-1" />

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
          {/* Like */}

          <button
            type="button"
            onClick={
              handleLike
            }
            className={`
              group/like
              flex
              items-center
              gap-1.5
              rounded-xl
              px-2
              py-1.5
              text-xs
              font-black
              transition
              ${
                liked
                  ? "bg-orange-50 text-orange-500"
                  : "text-gray-400 hover:bg-orange-50 hover:text-orange-500"
              }
            `}
          >
            <ChevronUp
              className={`
                h-4
                w-4
                transition-transform
                ${
                  liked
                    ? "scale-110"
                    : "group-hover/like:-translate-y-0.5"
                }
              `}
            />

            <span>
              {likeCount}
            </span>

            <span className="hidden text-[9px] font-semibold sm:inline">
              {likeCount ===
              1
                ? "upvote"
                : "upvotes"}
            </span>
          </button>

          {/* Right actions */}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={
                handleShare
              }
              className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-50 hover:text-orange-500"
              title="Share"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

