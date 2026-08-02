
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  calculateRoute,
  getPublicItinerary,
  uploadStopPhoto,
} from "../../api/itinerary";
import { useAuthStore } from "../../stores/authStore";
import MapView from "../../components/MapView";

import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Compass,
  ImagePlus,
  LoaderCircle,
  Map,
  MapPin,
  Navigation,
  Route,
  User,
} from "lucide-react";

export default function ItineraryDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();

  const [itinerary, setItinerary] = useState<any>(null);
  const [polyline, setPolyline] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);

  const [uploadingStopId, setUploadingStopId] = useState<string | null>(
    null
  );

  const [uploadError, setUploadError] = useState("");

  // ==========================================================
  // FETCH ITINERARY
  // ==========================================================

  const refetchItinerary = async () => {
    if (!id) return;

    try {
      const response = await getPublicItinerary(id);

      setItinerary(response.data);
    } catch (error) {
      console.error("Failed to refresh itinerary:", error);
    }
  };

  useEffect(() => {
    const fetchItinerary = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const response = await getPublicItinerary(id);

        setItinerary(response.data);
      } catch (error) {
        console.error("Failed to fetch itinerary:", error);

        setItinerary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [id]);

  // ==========================================================
  // CALCULATE ROUTE POLYLINE
  // ==========================================================

  useEffect(() => {
    const fetchRoute = async () => {
      if (!itinerary?.stops || itinerary.stops.length < 2) {
        setPolyline(null);

        return;
      }

      const coordinates = itinerary.stops
        .filter(
          (stop: any) =>
            typeof stop.latitude === "number" &&
            typeof stop.longitude === "number"
        )
        .map((stop: any) => ({
          lat: stop.latitude,
          lng: stop.longitude,
        }));

      if (coordinates.length < 2) {
        setPolyline(null);

        return;
      }

      try {
        setRouteLoading(true);

        const response = await calculateRoute(coordinates);

        const routeData = response.data?.polyline;

        if (typeof routeData === "string") {
          setPolyline(JSON.parse(routeData));
        } else {
          setPolyline(routeData);
        }
      } catch (error) {
        console.error("Failed to calculate route:", error);

        setPolyline(null);
      } finally {
        setRouteLoading(false);
      }
    };

    fetchRoute();
  }, [itinerary]);

  // ==========================================================
  // DERIVED DATA
  // ==========================================================

  const stops = useMemo(() => {
    return itinerary?.stops || [];
  }, [itinerary]);

  const itineraryId = itinerary?.id || itinerary?._id;

  const isOwner = Boolean(
    user &&
      itinerary &&
      String(user.id) ===
        String(itinerary.userId || itinerary.user?.id || itinerary.user?._id)
  );

  const mapCenter: [number, number] =
    stops.length > 0 &&
    typeof stops[0]?.latitude === "number" &&
    typeof stops[0]?.longitude === "number"
      ? [stops[0].latitude, stops[0].longitude]
      : [14.5995, 120.9842];

  const coverPhotoUrl =
    itinerary?.coverPhoto ||
    itinerary?.coverPhoto?.url ||
    itinerary?.image?.url ||
    "";

  const formattedDistance =
    typeof itinerary?.totalDistance === "number"
      ? `${itinerary.totalDistance.toFixed(1)} km`
      : itinerary?.totalDistance
      ? `${itinerary.totalDistance} km`
      : null;

  const difficultyStyles: Record<string, string> = {
    Easy: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Medium: "border-amber-200 bg-amber-50 text-amber-700",
    Hard: "border-orange-200 bg-orange-50 text-orange-700",
    Expert: "border-red-200 bg-red-50 text-red-700",
  };

  const difficultyClass =
    difficultyStyles[itinerary?.difficulty] ||
    "border-gray-200 bg-gray-50 text-gray-700";

  // ==========================================================
  // UPLOAD STOP PHOTO
  // ==========================================================

  const handleStopPhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    stopId: string
  ) => {
    const file = event.target.files?.[0];

    if (!file || !itineraryId) return;

    setUploadError("");
    setUploadingStopId(stopId);

    try {
      const formData = new FormData();

      formData.append("photo", file);

      await uploadStopPhoto(itineraryId, stopId, formData);

      await refetchItinerary();
    } catch (error) {
      console.error("Failed to upload stop photo:", error);

      setUploadError(
        "The photo could not be uploaded. Please try again."
      );
    } finally {
      setUploadingStopId(null);

      // Allows selecting the same file again after an error.
      event.target.value = "";
    }
  };

  // ==========================================================
  // OPEN GOOGLE MAPS
  // ==========================================================

  const openGoogleMaps = () => {
    if (stops.length === 0) return;

    const validStops = stops.filter(
      (stop: any) =>
        typeof stop.latitude === "number" &&
        typeof stop.longitude === "number"
    );

    if (validStops.length === 0) return;

    const firstStop = validStops[0];
    const lastStop = validStops[validStops.length - 1];

    const origin = `${firstStop.latitude},${firstStop.longitude}`;

    const destination = `${lastStop.latitude},${lastStop.longitude}`;

    const waypoints = validStops
      .slice(1, -1)
      .map(
        (stop: any) =>
          `${stop.latitude},${stop.longitude}`
      )
      .join("|");

    const googleMapsUrl =
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${encodeURIComponent(origin)}` +
      `&destination=${encodeURIComponent(destination)}` +
      `${waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ""}` +
      `&travelmode=driving`;

    window.open(
      googleMapsUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f5f2] pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header skeleton */}
          <div className="mb-8 flex items-center justify-between">
            <div className="h-10 w-44 animate-pulse rounded-xl bg-gray-200" />

            <div className="h-10 w-28 animate-pulse rounded-xl bg-gray-200" />
          </div>

          {/* Hero skeleton */}
          <div className="overflow-hidden rounded-4xl bg-white shadow-sm">
            <div className="h-105 animate-pulse bg-gray-200 sm:h-125" />

            <div className="space-y-5 p-7 sm:p-10">
              <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />

              <div className="h-12 w-3/4 animate-pulse rounded bg-gray-200" />

              <div className="h-5 w-full animate-pulse rounded bg-gray-100" />

              <div className="h-5 w-2/3 animate-pulse rounded bg-gray-100" />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="mt-10 grid gap-8 lg:grid-cols-5">
            <div className="h-137.5 animate-pulse rounded-4xl bg-gray-200 lg:col-span-3" />

            <div className="space-y-5 lg:col-span-2">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-44 animate-pulse rounded-3xl bg-white"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // NOT FOUND STATE
  // ==========================================================

  if (!itinerary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f5f2] px-4 pt-24">
        <div className="w-full max-w-lg rounded-4xl border border-gray-200 bg-white p-8 text-center shadow-xl shadow-gray-200/50 sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-50 text-orange-500">
            <Compass className="h-10 w-10" />
          </div>

          <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
            Route unavailable
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#242222]">
            Itinerary not found
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-gray-500">
            We could not find the itinerary you are looking for.
            It may have been removed, made private, or the link may
            be incorrect.
          </p>

          <Link
            to="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#242222] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-orange-500"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN PAGE
  // ==========================================================

  return (
    <div className="min-h-screen overflow-hidden bg-[#f6f5f2] pt-20 pb-20">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-orange-200/20 blur-3xl" />

        <div className="absolute -left-40 top-[55%] h-96 w-96 rounded-full bg-amber-100/40 blur-3xl" />
      </div>

      {/* ======================================================
          TOP NAVIGATION
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-[#f6f5f2]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/dashboard"
            className="group inline-flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-bold text-gray-600 transition hover:bg-white hover:text-orange-500"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm transition group-hover:bg-orange-50">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </span>

            <span className="hidden sm:inline">
              Back to Dashboard
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-white px-4 py-2 text-xs font-bold text-gray-500 shadow-sm sm:inline">
              {stops.length} stop
              {stops.length !== 1 ? "s" : ""}
            </span>

            {itinerary.difficulty && (
              <span
                className={`rounded-full border px-3 py-2 text-xs font-bold ${difficultyClass}`}
              >
                {itinerary.difficulty}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ====================================================
            HERO
        ==================================================== */}

        <section className="mt-7 overflow-hidden rounded-4xl bg-[#242222] shadow-2xl shadow-gray-300/50">
          <div className="relative min-h-130">
            {/* Cover image */}
            {coverPhotoUrl ? (
              <img
                src={coverPhotoUrl}
                alt={itinerary.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-linear-to-br from-[#242222] via-[#373434] to-orange-950">
                <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full border border-white/10" />

                <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
              </div>
            )}

            {/* Image overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-[#181717] via-[#242222]/70 to-black/20" />

            <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent" />

            {/* Hero content */}
            <div className="relative flex min-h-130 items-end p-6 sm:p-10 lg:p-14">
              <div className="max-w-4xl">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-400/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-200 backdrop-blur-md">
                    <Compass className="h-4 w-4" />

                    Community route
                  </div>

                  {itinerary.difficulty && (
                    <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-md">
                      {itinerary.difficulty} ride
                    </div>
                  )}
                </div>

                <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-7xl">
                  {itinerary.name}
                </h1>

                {itinerary.description && (
                  <p className="mt-6 max-w-3xl text-sm leading-7 text-gray-200 sm:text-base lg:text-lg lg:leading-8">
                    {itinerary.description}
                  </p>
                )}

                {/* Hero statistics */}
                <div className="mt-8 flex flex-wrap gap-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-400 text-white">
                      <MapPin className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-lg font-black text-white">
                        {stops.length}
                      </p>

                      <p className="text-xs text-gray-300">
                        Route stops
                      </p>
                    </div>
                  </div>

                  {itinerary.estimatedTime && (
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-orange-300">
                        <Clock3 className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-black text-white">
                          {itinerary.estimatedTime}
                        </p>

                        <p className="text-xs text-gray-300">
                          Estimated ride
                        </p>
                      </div>
                    </div>
                  )}

                  {formattedDistance && (
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-orange-300">
                        <Route className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-black text-white">
                          {formattedDistance}
                        </p>

                        <p className="text-xs text-gray-300">
                          Total distance
                        </p>
                      </div>
                    </div>
                  )}

                  {itinerary.user?.name && (
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-orange-300">
                        <User className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="max-w-37.5 truncate text-sm font-black text-white">
                          {itinerary.user.name}
                        </p>

                        <p className="text-xs text-gray-300">
                          Route creator
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            ROUTE CONTENT
        ==================================================== */}

        <main className="mt-10 lg:grid lg:grid-cols-5 lg:gap-8 xl:gap-10">
          {/* ==================================================
              MAP
          ================================================== */}

          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-4xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50">
                {/* Map heading */}
                <div className="flex flex-col gap-5 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                      <Map className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
                        Interactive route
                      </p>

                      <h2 className="mt-1 text-xl font-black text-[#242222]">
                        Route overview
                      </h2>
                    </div>
                  </div>

                  {routeLoading && (
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-gray-400">
                      <LoaderCircle className="h-4 w-4 animate-spin" />

                      Calculating route...
                    </div>
                  )}
                </div>

                {/* Map */}
                <div className="relative h-95 bg-gray-100 sm:h-125 lg:h-152.5">
                  <MapView
                    locations={stops
                      .filter(
                        (stop: any) =>
                          typeof stop.latitude === "number" &&
                          typeof stop.longitude === "number"
                      )
                      .map((stop: any) => ({
                        id: stop.id || stop._id,
                        latitude: stop.latitude,
                        longitude: stop.longitude,
                        name: stop.name,
                        address: stop.address,
                      }))}
                    center={mapCenter}
                    zoom={12}
                    showNumbers
                    polyline={polyline}
                  />

                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />
                </div>

                {/* Map footer */}
                <div className="flex flex-col gap-4 border-t border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                      <Navigation className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#242222]">
                        Ready to ride?
                      </p>

                      <p className="text-xs text-gray-500">
                        Open this route in Google Maps.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={openGoogleMaps}
                    disabled={stops.length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-400 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-500 hover:shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Navigation className="h-4 w-4" />

                    Open in Google Maps
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* ==================================================
              STOPS TIMELINE
          ================================================== */}

          <section className="mt-10 lg:col-span-2 lg:mt-0">
            <div className="mb-8">
              <div className="flex items-center gap-2">
                <div className="h-7 w-1 rounded-full bg-orange-400" />

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
                  Follow the journey
                </p>
              </div>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#242222]">
                Route stops
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Explore every destination included in this
                itinerary.
              </p>
            </div>

            {/* Upload error */}
            {uploadError && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <ImagePlus className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-bold text-red-700">
                    Upload failed
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-600">
                    {uploadError}
                  </p>
                </div>
              </div>
            )}

            {/* Empty stops */}
            {stops.length === 0 && (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <MapPin className="h-6 w-6" />
                </div>

                <h3 className="mt-5 text-lg font-black text-[#242222]">
                  No stops available
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  This itinerary does not have any route stops
                  yet.
                </p>
              </div>
            )}

            {/* Stop timeline */}
            {stops.length > 0 && (
              <div className="relative">
                {stops.map(
                  (stop: any, index: number) => {
                    const stopId = stop.id || stop._id;

                    const photos = Array.isArray(stop.photos)
                      ? stop.photos
                      : [];

                    const isUploading =
                      uploadingStopId === stopId;

                    return (
                      <div
                        key={stopId || index}
                        className="group relative flex gap-4 pb-8 last:pb-0 sm:gap-5"
                      >
                        {/* Timeline */}
                        <div className="relative flex w-12 shrink-0 flex-col items-center">
                          <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#242222] text-sm font-black text-white shadow-lg shadow-gray-300 transition duration-300 group-hover:scale-105 group-hover:bg-orange-400">
                            {index + 1}
                          </div>

                          {index < stops.length - 1 && (
                            <div className="absolute top-12 bottom-0 w-px bg-linear-to-b from-orange-300 via-gray-200 to-gray-200" />
                          )}
                        </div>

                        {/* Stop card */}
                        <article className="min-w-0 flex-1 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-gray-200/50 sm:p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-500">
                                Stop {index + 1}
                              </p>

                              <h3 className="mt-2 wrap-break-word text-xl font-black text-[#242222]">
                                {stop.name ||
                                  `Destination ${index + 1}`}
                              </h3>
                            </div>

                            {index === 0 && (
                              <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
                                Start
                              </span>
                            )}

                            {index === stops.length - 1 &&
                              index !== 0 && (
                                <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1.5 text-[11px] font-bold text-orange-600">
                                  Finish
                                </span>
                              )}
                          </div>

                          {stop.address && (
                            <div className="mt-4 flex items-start gap-2.5 text-gray-500">
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />

                              <p className="text-sm leading-6">
                                {stop.address}
                              </p>
                            </div>
                          )}

                          {stop.description && (
                            <div className="mt-5 border-t border-gray-100 pt-5">
                              <p className="text-sm leading-7 text-gray-600">
                                {stop.description}
                              </p>
                            </div>
                          )}

                          {/* Distance from previous stop */}
                          {index > 0 &&
                            stop.distanceFromPrev && (
                              <div className="mt-5 flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-xs font-semibold text-gray-500">
                                <Route className="h-4 w-4 text-orange-400" />

                                {stop.distanceFromPrev} km from
                                the previous stop
                              </div>
                            )}

                          {/* Stop photos */}
                          {photos.length > 0 && (
                            <div className="mt-5">
                              <div className="mb-3 flex items-center gap-2">
                                <Camera className="h-4 w-4 text-orange-500" />

                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                                  Rider photos
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                {photos.map(
                                  (
                                    photo: any,
                                    photoIndex: number
                                  ) => {
                                    const photoUrl =
                                      typeof photo === "string"
                                        ? photo
                                        : photo.url;

                                    return (
                                      <div
                                        key={
                                          photo.id ||
                                          photo._id ||
                                          photoIndex
                                        }
                                        className="group/photo relative aspect-4/3 overflow-hidden rounded-xl bg-gray-100"
                                      >
                                        <img
                                          src={photoUrl}
                                          alt={`${stop.name} photo ${
                                            photoIndex + 1
                                          }`}
                                          className="h-full w-full object-cover transition duration-500 group-hover/photo:scale-110"
                                        />

                                        <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent opacity-0 transition group-hover/photo:opacity-100" />
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          )}

                          {/* Owner upload */}
                          {isOwner && (
                            <div className="mt-5 border-t border-gray-100 pt-5">
                              <label
                                className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
                                  isUploading
                                    ? "cursor-wait border-gray-200 bg-gray-100 text-gray-400"
                                    : "border-orange-200 bg-orange-50 text-orange-600 hover:border-orange-400 hover:bg-orange-100"
                                }`}
                              >
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={isUploading}
                                  onChange={(event) =>
                                    handleStopPhotoUpload(
                                      event,
                                      stopId
                                    )
                                  }
                                />

                                {isUploading ? (
                                  <LoaderCircle className="h-4 w-4 animate-spin" />
                                ) : (
                                  <ImagePlus className="h-4 w-4" />
                                )}

                                {isUploading
                                  ? "Uploading photo..."
                                  : photos.length > 0
                                  ? "Add another photo"
                                  : "Share a photo"}
                              </label>
                            </div>
                          )}
                        </article>
                      </div>
                    );
                  }
                )}
              </div>
            )}

            {/* Route completion */}
            {stops.length > 0 && (
              <div className="mt-8 flex items-center gap-4 rounded-3xl border border-orange-100 bg-orange-50/70 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-400 text-white shadow-lg shadow-orange-500/20">
                  <CheckCircle2 className="h-6 w-6" />
                </div>

                <div>
                  <p className="font-black text-[#242222]">
                    Route ready to explore
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Follow all {stops.length} stops and make the
                    journey your own.
                  </p>
                </div>
              </div>
            )}

            {/* Mobile Google Maps button */}
            <button
              type="button"
              onClick={openGoogleMaps}
              disabled={stops.length === 0}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#242222] px-6 py-4 text-sm font-bold text-white shadow-xl transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50 lg:hidden"
            >
              <Navigation className="h-5 w-5" />

              Start this route in Google Maps

              <ChevronRight className="h-4 w-4" />
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}

