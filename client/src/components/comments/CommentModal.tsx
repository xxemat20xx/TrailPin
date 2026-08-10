
import {
  useState,
  useEffect,
  useRef,
} from "react";
import {
  X,
  Send,
  Trash2,
  MessageCircle,
  Loader2,
  AlertCircle,
  UserRound,
} from "lucide-react";

import { useAuthStore } from "../../stores/authStore";
import {
  getComments,
  addComment,
  deleteComment,
} from "../../api/itinerary";

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

const MAX_COMMENT_LENGTH = 500;

export default function CommentModal({
  itineraryId,
  itineraryName,
  onClose,
}: Props) {
  const { user } = useAuthStore();

  const [comments, setComments] =
    useState<Comment[]>([]);

  const [newComment, setNewComment] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const inputRef =
    useRef<HTMLInputElement>(null);

  // ==========================================================
  // FETCH COMMENTS
  // ==========================================================

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError("");

      const res =
        await getComments(
          itineraryId
        );

      setComments(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load comments:",
        err
      );

      setError(
        "We couldn't load the comments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [itineraryId]);

  // ==========================================================
  // ESCAPE KEY + BODY SCROLL
  // ==========================================================

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape"
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    const originalOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        originalOverflow;
    };
  }, [onClose]);

  // ==========================================================
  // ADD COMMENT
  // ==========================================================

  const handleAddComment =
    async () => {
      const text =
        newComment.trim();

      if (
        !text ||
        !user ||
        submitting
      ) {
        return;
      }

      if (
        text.length >
        MAX_COMMENT_LENGTH
      ) {
        setError(
          `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters.`
        );

        return;
      }

      try {
        setSubmitting(true);
        setError("");

        const res =
          await addComment(
            itineraryId,
            text
          );

        setComments(
          (prev) => [
            res.data,
            ...prev,
          ]
        );

        setNewComment("");

        // Keep focus on input
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      } catch (err) {
        console.error(
          "Failed to post comment:",
          err
        );

        setError(
          "We couldn't post your comment. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    };

  // ==========================================================
  // DELETE COMMENT
  // ==========================================================

  const handleDeleteComment =
    async (
      commentId: string
    ) => {
      if (
        deletingId
      ) {
        return;
      }

      try {
        setDeletingId(
          commentId
        );

        setError("");

        await deleteComment(
          itineraryId,
          commentId
        );

        setComments(
          (prev) =>
            prev.filter(
              (comment) =>
                comment.id !==
                commentId
            )
        );
      } catch (err) {
        console.error(
          "Failed to delete comment:",
          err
        );

        setError(
          "We couldn't delete this comment. Please try again."
        );
      } finally {
        setDeletingId(
          null
        );
      }
    };

  // ==========================================================
  // DATE FORMAT
  // ==========================================================

  const formatDate = (
    dateString: string
  ) => {
    const date =
      new Date(
        dateString
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    const now =
      new Date();

    const diff =
      now.getTime() -
      date.getTime();

    const seconds =
      Math.floor(
        diff / 1000
      );

    const minutes =
      Math.floor(
        seconds / 60
      );

    const hours =
      Math.floor(
        minutes / 60
      );

    const days =
      Math.floor(
        hours / 24
      );

    if (
      seconds < 30
    ) {
      return "just now";
    }

    if (
      minutes < 60
    ) {
      return `${minutes}m ago`;
    }

    if (
      hours < 24
    ) {
      return `${hours}h ago`;
    }

    if (
      days < 7
    ) {
      return `${days}d ago`;
    }

    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !==
          now.getFullYear()
            ? "numeric"
            : undefined,
      }
    );
  };

  // ==========================================================
  // INITIALS
  // ==========================================================

  const getInitials = (
    name?: string
  ) => {
    if (!name) {
      return "?";
    }

    const parts =
      name
        .trim()
        .split(/\s+/);

    if (
      parts.length >= 2
    ) {
      return `${parts[0][0]}${parts[1][0]}`
        .toUpperCase();
    }

    return name
      .charAt(0)
      .toUpperCase();
  };

  // ==========================================================
  // SUBMIT ON ENTER
  // ==========================================================

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key ===
        "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleAddComment();
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        className="flex h-[min(720px,calc(100vh-24px))] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#f8f7f4] shadow-2xl shadow-black/30"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="relative shrink-0 border-b border-gray-200 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <MessageCircle className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-[#242222]">
                    Comments
                  </h2>

                  {!loading && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                      {
                        comments.length
                      }
                    </span>
                  )}
                </div>

                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {itineraryName}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-[#242222]"
              aria-label="Close comments"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="shrink-0 border-b border-red-100 bg-red-50 px-5 py-3 sm:px-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

              <p className="text-xs font-medium leading-5 text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ==================================================
            COMMENTS
        ================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {loading ? (
            <LoadingComments />
          ) : comments.length ===
            0 ? (
            <EmptyComments
              onFocus={() =>
                inputRef.current?.focus()
              }
              isLoggedIn={
                Boolean(user)
              }
            />
          ) : (
            <div className="space-y-5">
              {comments.map(
                (
                  comment
                ) => (
                  <CommentItem
                    key={
                      comment.id
                    }
                    comment={
                      comment
                    }
                    deleting={
                      deletingId ===
                      comment.id
                    }
                    formatDate={
                      formatDate
                    }
                    getInitials={
                      getInitials
                    }
                    onDelete={() =>
                      handleDeleteComment(
                        comment.id
                      )
                    }
                  />
                )
              )}
            </div>
          )}
        </div>

        {/* ==================================================
            INPUT
        ================================================== */}

        {user ? (
          <div className="shrink-0 border-t border-gray-200 bg-white p-4 sm:p-5">
            <div className="flex items-start gap-3">
              {/* Current user avatar */}

              <div className="hidden h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#242222] sm:flex">
                {user.avatar ? (
                  <img
                    src={
                      user.avatar
                    }
                    alt={
                      user.name ||
                      "You"
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-black text-white">
                    {getInitials(
                      user.name
                    )}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-1.5 transition focus-within:border-orange-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100">
                  <input
                    ref={
                      inputRef
                    }
                    type="text"
                    value={
                      newComment
                    }
                    onChange={(
                      event
                    ) => {
                      setNewComment(
                        event
                          .target
                          .value
                          .slice(
                            0,
                            MAX_COMMENT_LENGTH
                          )
                      );

                      if (
                        error
                      ) {
                        setError(
                          ""
                        );
                      }
                    }}
                    onKeyDown={
                      handleKeyDown
                    }
                    placeholder="Share your thoughts about this route..."
                    disabled={
                      submitting
                    }
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-[#242222] outline-none placeholder:text-gray-400 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={
                      handleAddComment
                    }
                    disabled={
                      !newComment.trim() ||
                      submitting
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-400 text-white shadow-sm transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Post comment"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="mt-1.5 flex items-center justify-between px-2">
                  <p className="text-[10px] text-gray-400">
                    Press Enter to
                    post
                  </p>

                  <p
                    className={`text-[10px] ${
                      newComment.length >=
                      MAX_COMMENT_LENGTH
                        ? "font-bold text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {
                      newComment.length
                    }
                    /
                    {
                      MAX_COMMENT_LENGTH
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="shrink-0 border-t border-gray-200 bg-white px-5 py-4 text-center">
            <div className="mx-auto flex max-w-md items-center justify-center gap-2">
              <UserRound className="h-4 w-4 text-gray-400" />

              <p className="text-xs text-gray-500">
                <button
                  type="button"
                  onClick={() => {
                    // Keep this callback
                    // ready for your
                    // login navigation.
                  }}
                  className="font-bold text-orange-500 hover:text-orange-600 hover:underline"
                >
                  Log in
                </button>{" "}
                to join the
                conversation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   COMMENT ITEM
============================================================ */

interface CommentItemProps {
  comment: Comment;
  deleting: boolean;
  formatDate: (
    date: string
  ) => string;
  getInitials: (
    name?: string
  ) => string;
  onDelete: () => void;
}

function CommentItem({
  comment,
  deleting,
  formatDate,
  getInitials,
  onDelete,
}: CommentItemProps) {
  return (
    <article className="group flex gap-3">
      {/* Avatar */}

      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200">
        {comment.user
          .avatar ? (
          <img
            src={
              comment.user
                .avatar
            }
            alt={
              comment.user
                .name
            }
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#242222] text-xs font-black text-white">
            {getInitials(
              comment.user
                .name
            )}
          </div>
        )}
      </div>

      {/* Content */}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-sm font-black text-[#242222]">
                {
                  comment
                    .user
                    .name
                }
              </span>

              <span className="text-[10px] text-gray-400">
                {formatDate(
                  comment.createdAt
                )}
              </span>
            </div>
          </div>

          {comment.canDelete && (
            <button
              type="button"
              onClick={
                onDelete
              }
              disabled={
                deleting
              }
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50 sm:opacity-0"
              title="Delete comment"
              aria-label="Delete comment"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        <div className="mt-1.5 rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
            {
              comment.text
            }
          </p>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyComments({
  onFocus,
  isLoggedIn,
}: {
  onFocus: () => void;
  isLoggedIn: boolean;
}) {
  return (
    <div className="flex h-full min-h-[300px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        <MessageCircle className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-lg font-black text-[#242222]">
        No comments yet
      </h3>

      <p className="mt-2 max-w-sm text-xs leading-5 text-gray-500">
        Be the first rider to
        share your thoughts,
        tips, or experience
        about this route.
      </p>

      {isLoggedIn && (
        <button
          type="button"
          onClick={
            onFocus
          }
          className="mt-5 rounded-xl bg-orange-400 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-orange-500"
        >
          Write the first
          comment
        </button>
      )}
    </div>
  );
}

/* ============================================================
   LOADING STATE
============================================================ */

function LoadingComments() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="flex gap-3"
          >
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200" />

            <div className="flex-1">
              <div className="h-3 w-32 animate-pulse rounded-full bg-gray-200" />

              <div className="mt-2 h-12 w-full animate-pulse rounded-2xl bg-gray-200" />
            </div>
          </div>
        )
      )}
    </div>
  );
}

