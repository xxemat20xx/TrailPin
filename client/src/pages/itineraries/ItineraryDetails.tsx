import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getItinerary, calculateRoute } from "../../api/itinerary";
import MapView from "../../components/MapView";
import {
  ArrowLeft,
  Clock3,
  Route,
  MapPin,
  User,
  Navigation,
  Calendar,
  ChevronRight,
} from "lucide-react";

export default function ItineraryDetail() {
  const { id } = useParams<{ id: string }>();

  const [itinerary, setItinerary] = useState<any>(null);
  const [polyline, setPolyline] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    getItinerary(id)
      .then((res) => setItinerary(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (itinerary?.stops?.length >= 2) {
      const coords = itinerary.stops.map((s: any) => ({
        lat: s.latitude,
        lng: s.longitude,
      }));

      calculateRoute(coords)
        .then((res) => setPolyline(JSON.parse(res.data.polyline)))
        .catch(console.error);
    }
  }, [itinerary]);

  // ------------------------------------------------------------------
  // Loading state
  // ------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-rose-50">
        <div className="text-center space-y-6">
          <div className="relative mx-auto h-20 w-20">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600"></div>
          </div>
          <p className="text-sm font-medium tracking-widest text-indigo-400 uppercase">
            Loading your journey
          </p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Not found state
  // ------------------------------------------------------------------
  if (!itinerary) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-rose-50">
        <div className="text-center space-y-8">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl shadow-indigo-100">
            <Navigation className="h-10 w-10 text-indigo-300" />
          </div>
          <div>
            <h2 className="text-3xl font-light text-slate-800 mb-3">
              Itinerary not found
            </h2>
            <p className="text-slate-500 max-w-md mx-auto">
              We couldn’t locate the itinerary you’re looking for. It may have been
              removed or the link is incorrect.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300/50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const stops = itinerary.stops || [];
  const mapCenter: [number, number] =
    stops.length > 0
      ? [stops[0].latitude, stops[0].longitude]
      : [14.6, 121];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-all hover:text-indigo-600"
            >
              <div className="rounded-full bg-slate-100 p-1.5 transition-all group-hover:bg-indigo-100 group-hover:text-indigo-600">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              </div>
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>

            {/* Quick stats on mobile */}
            <div className="flex items-center gap-3 sm:hidden">
              <span className="text-sm font-medium text-slate-600">
                {stops.length} stops
              </span>
              {itinerary.estimatedTime && (
                <span className="text-sm font-medium text-slate-600">
                  {itinerary.estimatedTime}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative border-b border-slate-100 bg-white/40 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight tracking-tight text-slate-900">
                {itinerary.name}
              </h1>
              {itinerary.description && (
                <p className="mt-4 max-w-3xl text-lg text-slate-600 font-light leading-relaxed">
                  {itinerary.description}
                </p>
              )}
            </div>

            {/* Pill badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm shadow-sm">
                <MapPin className="h-4 w-4 text-indigo-400" />
                <span>
                  <span className="font-semibold text-slate-900">{stops.length}</span>
                  <span className="text-slate-500 ml-1">stops</span>
                </span>
              </div>

              {itinerary.estimatedTime && (
                <div className="flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm shadow-sm">
                  <Clock3 className="h-4 w-4 text-indigo-400" />
                  <span className="font-medium text-slate-700">
                    {itinerary.estimatedTime}
                  </span>
                </div>
              )}

              {itinerary.totalDistance && (
                <div className="flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm shadow-sm">
                  <Route className="h-4 w-4 text-indigo-400" />
                  <span className="font-medium text-slate-700">
                    {itinerary.totalDistance.toFixed(2)} km
                  </span>
                </div>
              )}

              {itinerary.difficulty && (
                <div className="rounded-full bg-indigo-600 px-4 py-2 shadow-lg shadow-indigo-200">
                  <span className="text-sm font-semibold text-white">
                    {itinerary.difficulty}
                  </span>
                </div>
              )}

              {itinerary.user?.name && (
                <div className="flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm shadow-sm">
                  <User className="h-4 w-4 text-indigo-400" />
                  <span className="font-medium text-slate-700">
                    {itinerary.user.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main content: responsive layout */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="lg:grid lg:grid-cols-5 lg:gap-10 xl:gap-16">
          {/* Map column – sticky on desktop */}
          <aside className="lg:col-span-3 mb-10 lg:mb-0">
            <div className="lg:sticky lg:top-28">
              <div className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-indigo-100/50 transition-shadow hover:shadow-indigo-200/60">
                <div className="relative h-[400px] lg:h-[600px]">
                  <MapView
                    locations={stops.map((s: any) => ({
                      id: s.id,
                      latitude: s.latitude,
                      longitude: s.longitude,
                      name: s.name,
                      address: s.address,
                    }))}
                    center={mapCenter}
                    zoom={12}
                    showNumbers
                    polyline={polyline}
                  />
                </div>
                {/* Subtle gradient overlay for map aesthetics */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/5"></div>
              </div>
            </div>
          </aside>

          {/* Stops timeline column */}
          <section className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-2xl font-light tracking-tight text-slate-900 sm:text-3xl">
                Your Journey
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Follow the route and explore each destination
              </p>
            </div>

            <div className="space-y-10">
              {stops.map((stop: any, index: number) => (
                <div key={stop.id} className="group relative flex gap-5">
                  {/* Timeline node */}
                  <div className="relative flex flex-col items-center">
                    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200 transition-transform group-hover:scale-110">
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    {index !== stops.length - 1 && (
                      <div className="mt-3 h-full w-0.5 bg-gradient-to-b from-indigo-300 to-transparent"></div>
                    )}
                  </div>

                  {/* Stop card */}
                  <div className="flex-1 pb-8">
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50">
                      <div className="space-y-3">
                        <h3 className="text-xl font-light text-slate-900">
                          {stop.name}
                        </h3>

                        <div className="flex items-start gap-2 text-slate-500">
                          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-400" />
                          <span className="text-sm leading-relaxed">
                            {stop.address}
                          </span>
                        </div>

                        {stop.description && (
                          <div className="pt-3 border-t border-slate-50">
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {stop.description}
                            </p>
                          </div>
                        )}

                        {/* Optional: show distance/time from previous stop */}
                        {index > 0 && stop.distanceFromPrev && (
                          <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
                            <Route className="h-3.5 w-3.5" />
                            <span>{stop.distanceFromPrev} km from previous stop</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick action buttons */}
            <div className="mt-12 flex flex-wrap gap-4">
              <button
              onClick={() => {
                if (stops.length === 0) return;
                const origin = `${stops[0].latitude},${stops[0].longitude}`;
                const destination = `${stops[stops.length - 1].latitude},${stops[stops.length - 1].longitude}`;
                const waypoints = stops.slice(1, -1).map(s => `${s.latitude},${s.longitude}`).join('|');
                const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ''}&travelmode=driving`;
                window.open(url, '_blank', 'noopener');
              }}
              className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
            >
              <Navigation className="h-4 w-4" />
              Open in Google Maps
            </button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer spacer */}
      <div className="h-16"></div>
    </div>
  );
}