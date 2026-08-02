
import {
  Search,
  MapPin,
  Users,
  Route,
  TrendingUp,
  Filter,
  Plus,
  ArrowRight,
  Compass,
  SlidersHorizontal,
  X,
  Sparkles,
} from "lucide-react";
import { getPublicItineraries } from "../api/itinerary";
import { useAuthStore } from "../stores/authStore";
import { useDestinationStore } from "../stores/destinationStore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ItineraryCard from "../components/itinerary/ItineraryCard";

type SortOption = "trending" | "top" | "newest";

export default function Dashboard() {
  const { destinations, fetchDestinations } = useDestinationStore();
  const { fetchUsers, users, user } = useAuthStore();

  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("trending");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);

      try {
        await Promise.all([
          fetchDestinations(),
          fetchUsers(),
          getPublicItineraries().then((res) => {
            setItineraries(res.data || []);
          }),
        ]);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [fetchDestinations, fetchUsers]);

  const filteredItineraries = useMemo(() => {
    return itineraries
      .filter((itinerary) => {
        const query = searchQuery.trim().toLowerCase();

        const matchesSearch =
          !query ||
          itinerary.name?.toLowerCase().includes(query) ||
          itinerary.description?.toLowerCase().includes(query) ||
          itinerary.stops?.some((stop: any) =>
            stop.name?.toLowerCase().includes(query)
          );

        const matchesDifficulty =
          difficultyFilter === "All" ||
          itinerary.difficulty === difficultyFilter;

        return matchesSearch && matchesDifficulty;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
        }

        if (sortBy === "top") {
          return (b.likeCount || 0) - (a.likeCount || 0);
        }

        // Trending score:
        // More likes increase the score, while older routes gradually decrease.
        const getTrendingScore = (itinerary: any) => {
          const createdAt = new Date(itinerary.createdAt).getTime();
          const ageInDays =
            (Date.now() - createdAt) / (1000 * 60 * 60 * 24);

          return (itinerary.likeCount || 0) / (ageInDays + 1);
        };

        return getTrendingScore(b) - getTrendingScore(a);
      });
  }, [itineraries, searchQuery, sortBy, difficultyFilter]);

  const displayedItineraries = filteredItineraries.slice(0, 6);

  const clearFilters = () => {
    setSearchQuery("");
    setDifficultyFilter("All");
    setSortBy("trending");
  };

  const stats = [
    {
      label: "Community Riders",
      value: users.length,
      icon: Users,
      description: "Exploring together",
    },
    {
      label: "Destinations",
      value: destinations.length,
      icon: MapPin,
      description: "Places to discover",
    },
    {
      label: "Routes Shared",
      value: itineraries.length,
      icon: Route,
      description: "Community adventures",
    },
  ];

  const sortOptions: {
    value: SortOption;
    label: string;
  }[] = [
    {
      value: "trending",
      label: "Trending",
    },
    {
      value: "top",
      label: "Most Liked",
    },
    {
      value: "newest",
      label: "Newest",
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f5f2] pt-24 pb-16">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute top-[45%] -left-40 h-96 w-96 rounded-full bg-amber-100/50 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =====================================================
            HERO SECTION
        ====================================================== */}
        <section className="relative overflow-hidden rounded-[2rem] bg-[#242222] px-6 py-10 shadow-2xl sm:px-10 sm:py-14 lg:px-14">
          {/* Decorative circles */}
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -right-8 top-12 h-52 w-52 rounded-full border border-orange-400/20" />
          <div className="absolute bottom-0 left-[45%] h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr]">
            {/* Hero content */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-2 text-sm font-semibold text-orange-300">
                <Sparkles className="h-4 w-4" />
                Explore roads beyond the ordinary
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Discover your next
                <span className="block bg-gradient-to-r from-orange-300 to-amber-400 bg-clip-text text-transparent">
                  epic ride.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
                Explore rider-created routes, discover scenic destinations,
                and share unforgettable motorcycle adventures with the
                TrailPin community.
              </p>

              {/* Search */}
              <div className="mt-8 max-w-2xl">
                <div className="group flex items-center rounded-2xl border border-white/10 bg-white p-2 shadow-xl transition focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-400/10">
                  <div className="ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <Search className="h-5 w-5" />
                  </div>

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Search routes, places, or destinations..."
                    className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 sm:text-base"
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-orange-400" />
                  Curated motorcycle routes
                </span>

                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-400" />
                  Detailed destination stops
                </span>
              </div>
            </div>

            {/* Hero side card */}
            <div className="hidden lg:block">
              <div className="relative mx-auto max-w-sm rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
                      Community
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-white">
                      Ride. Share. Repeat.
                    </h2>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-400 text-white shadow-lg shadow-orange-500/20">
                    <Route className="h-7 w-7" />
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-2xl font-black text-white">
                      {itineraries.length}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Shared routes
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-2xl font-black text-white">
                      {destinations.length}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Destinations
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      navigate("/login?redirect=/itineraries/new");
                      return;
                    }

                    navigate("/itineraries/new");
                  }}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-400 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-500/20"
                >
                  Create a route
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            STAT CARDS
        ====================================================== */}
        <section className="relative z-10 mx-auto -mt-3 grid max-w-6xl gap-4 sm:grid-cols-3 lg:-mt-6 lg:gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="group rounded-2xl border border-gray-200/80 bg-white p-5 shadow-lg shadow-gray-200/50 transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl sm:p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 transition group-hover:scale-110 group-hover:bg-orange-400 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-2xl font-black tracking-tight text-[#242222] sm:text-3xl">
                      {stat.value.toLocaleString()}
                    </p>

                    <p className="truncate text-sm font-semibold text-gray-700">
                      {stat.label}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-400">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* =====================================================
            FILTER CONTROLS
        ====================================================== */}
        <section className="mt-12 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            {/* Sort controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <TrendingUp className="h-4 w-4" />
                </div>

                Sort routes
              </div>

              <div className="flex w-full rounded-xl bg-gray-100 p-1 sm:w-auto">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSortBy(option.value)}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition sm:flex-none sm:px-4 sm:text-sm ${
                      sortBy === option.value
                        ? "bg-white text-orange-500 shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <Filter className="h-4 w-4" />
                </div>

                Difficulty
              </div>

              <select
                value={difficultyFilter}
                onChange={(event) =>
                  setDifficultyFilter(event.target.value)
                }
                className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              >
                <option value="All">All difficulty levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>
        </section>

        {/* =====================================================
            COMMUNITY ITINERARIES
        ====================================================== */}
        <section className="mt-10">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-7 w-1 rounded-full bg-orange-400" />

                <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
                  Explore the community
                </p>
              </div>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#242222] sm:text-4xl">
                Community itineraries
              </h2>

              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                {filteredItineraries.length} route
                {filteredItineraries.length !== 1 ? "s" : ""} found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDifficultyFilter("All")}
              className="group inline-flex items-center gap-2 self-start rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-bold text-orange-500 transition hover:border-orange-400 hover:bg-orange-50 sm:self-auto"
            >
              View all routes

              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-3xl border border-gray-200 bg-white"
                >
                  <div className="h-52 animate-pulse bg-gray-200" />

                  <div className="space-y-4 p-5">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />

                    <div className="h-4 w-full animate-pulse rounded bg-gray-100" />

                    <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Itinerary cards */}
          {!isLoading && displayedItineraries.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayedItineraries.map((itinerary) => (
                <ItineraryCard
                  key={itinerary.id || itinerary._id}
                  itinerary={itinerary}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && displayedItineraries.length === 0 && (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <Search className="h-7 w-7" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-[#242222]">
                No routes found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                We could not find an itinerary matching your search or
                difficulty filter.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-xl bg-[#242222] px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-500"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>

      {/* =====================================================
          FLOATING CREATE BUTTON
      ====================================================== */}
      <button
        type="button"
        onClick={() => {
          if (!user) {
            navigate("/login?redirect=/itineraries/new");
            return;
          }

          navigate("/itineraries/new");
        }}
        className="group fixed bottom-6 right-5 z-30 flex h-14 items-center gap-3 rounded-2xl bg-orange-400 px-4 text-white shadow-2xl shadow-orange-500/30 transition hover:bg-orange-500 hover:shadow-orange-500/40 sm:bottom-8 sm:right-8 sm:h-16"
        aria-label="Create a new itinerary"
      >
        <span className="hidden text-sm font-bold sm:block">
          Create Route
        </span>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 transition group-hover:rotate-90">
          <Plus className="h-6 w-6" />
        </div>
      </button>
    </main>
  );
}

