import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createItinerary,
  updateItinerary,
  getItinerary,
  calculateRoute,
} from "../../api/itinerary";
import { useItineraryStore } from "../../stores/itineraryStore";
import MapView from "../../components/MapView";
import StopList from "../../components/itinerary/StopList";
import AddStopModal from "../../components/itinerary/AddStopModal";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Compass,
  ImagePlus,
  Loader2,
  MapPinned,
  Mountain,
  Navigation,
  Plus,
  Route,
  Save,
  Upload,
  Users,
  X,
} from "lucide-react";

export default function ItineraryPlanner() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    name,
    description,
    estimatedTime,
    totalDistance,
    difficulty,
    tags,
    visibility,
    stops,
    setName,
    setDescription,
    setCoverPhoto,
    setEstimatedTime,
    setTotalDistance,
    setDifficulty,
    setTags,
    setVisibility,
    addStop,
    clear,
  } = useItineraryStore();

  const [saving, setSaving] = useState(false);
  const [loadingItinerary, setLoadingItinerary] = useState(Boolean(id));
  const [polyline, setPolyline] = useState<any>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [showAddStop, setShowAddStop] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const loadItinerary = async () => {
      if (!id) {
        clear();
        setCoverFile(null);
        setCoverPreview("");
        setLoadingItinerary(false);
        return;
      }

      try {
        setLoadingItinerary(true);
        const response = await getItinerary(id);
        const itinerary = response.data;

        setName(itinerary.name || "");
        setDescription(itinerary.description || "");

        const existingCover =
          typeof itinerary.coverPhoto === "string"
            ? itinerary.coverPhoto
            : itinerary.coverPhoto?.url || "";

        setCoverPhoto(existingCover);
        setCoverPreview(existingCover);
        setEstimatedTime(itinerary.estimatedTime || "");
        setTotalDistance(itinerary.totalDistance ?? 0);
        setDifficulty(itinerary.difficulty || "Easy");
        setTags(itinerary.tags || []);
        setVisibility(itinerary.visibility || "public");

        useItineraryStore.setState({
          stops: (itinerary.stops || []).map((stop: any) => ({
            id: stop.id || stop._id || crypto.randomUUID(),
            name: stop.name || "",
            latitude: stop.latitude,
            longitude: stop.longitude,
            address: stop.address || "",
            description: stop.description || "",
            arrivalNotes: stop.arrivalNotes || "",
            estimatedStay: stop.estimatedStay || "",
          })),
        });
      } catch (error) {
        console.error("Failed to load itinerary:", error);
        setFormError("We could not load this itinerary. Please try again.");
      } finally {
        setLoadingItinerary(false);
      }
    };

    loadItinerary();
  }, [id, clear, setName, setDescription, setCoverPhoto, setEstimatedTime, setTotalDistance, setDifficulty, setTags, setVisibility]);

  useEffect(() => {
    const buildRoute = async () => {
      const validStops = stops.filter(
        (stop) =>
          typeof stop.latitude === "number" && typeof stop.longitude === "number"
      );

      if (validStops.length < 2) {
        setPolyline(null);
        return;
      }

      try {
        setRouteLoading(true);
        const response = await calculateRoute(
          validStops.map((stop) => ({ lat: stop.latitude, lng: stop.longitude }))
        );
        const route = response.data?.polyline;
        setPolyline(typeof route === "string" ? JSON.parse(route) : route);
      } catch (error) {
        console.error("Route calculation failed:", error);
        setPolyline(null);
      } finally {
        setRouteLoading(false);
      }
    };

    buildRoute();
  }, [stops]);

  const center: [number, number] = useMemo(() => {
    const firstStop = stops.find(
      (stop) =>
        typeof stop.latitude === "number" && typeof stop.longitude === "number"
    );
    if (!firstStop) return [14.5995, 120.9842];
    return [firstStop.latitude, firstStop.longitude];
  }, [stops]);

  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setFormError("");
  };

  const removeCover = () => {
    if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    setCoverFile(null);
    setCoverPreview("");
    setCoverPhoto("");
  };

  const handleSave = async () => {
    setFormError("");

    if (!name.trim()) {
      setFormError("Please enter a title for your itinerary.");
      return;
    }
    if (!stops.length) {
      setFormError("Please add at least one destination stop.");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description);
      formData.append("estimatedTime", estimatedTime);
      formData.append("totalDistance", String(totalDistance || 0));
      formData.append("difficulty", difficulty);
      formData.append("tags", JSON.stringify(tags));
      formData.append("visibility", visibility);
      formData.append(
        "stops",
        JSON.stringify(
          stops.map((stop, index) => ({
            order: index + 1,
            name: stop.name,
            latitude: stop.latitude,
            longitude: stop.longitude,
            address: stop.address,
            description: stop.description,
            arrivalNotes: stop.arrivalNotes,
            estimatedStay: stop.estimatedStay,
          }))
        )
      );
      if (coverFile) formData.append("coverPhoto", coverFile);

      if (id) {
        await updateItinerary(id, formData);
        navigate(`/itineraries/${id}`);
      } else {
        const response = await createItinerary(formData);
        const createdId = response.data.id || response.data._id;
        navigate(`/itineraries/${createdId}`);
      }
    } catch (error) {
      console.error("Failed to save:", error);
      setFormError("The itinerary could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingItinerary) {
    return (
      <div className="min-h-screen bg-[#f4f3ef] pt-20">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
          <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] gap-4">
            <div className="h-12 w-full max-w-xs animate-pulse rounded-2xl bg-gray-200" />
            <div className="h-12 w-28 animate-pulse rounded-2xl bg-gray-200 sm:w-36" />
          </div>
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-[minmax(300px,340px)_minmax(0,2fr)_minmax(300px,340px)]">
            <div className="h-[320px] animate-pulse rounded-[2rem] bg-gray-200 lg:h-[620px]" />
            <div className="h-[420px] animate-pulse rounded-[2rem] bg-gray-200 lg:h-[620px]" />
            <div className="hidden h-[620px] animate-pulse rounded-[2rem] bg-gray-200 xl:block" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f3ef] pb-24 pt-20 text-[#242222] lg:pb-8">
      <header className="fixed top-0 z-999 border-b border-gray-200/80 bg-[#f4f3ef]/95 backdrop-blur-xl w-full">
        <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-500"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-orange-400" />
                <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500 xl:text-xs">
                  {id ? "Edit itinerary" : "New itinerary"}
                </p>
              </div>
              <h1 className="mt-0.5 truncate text-base font-black sm:text-lg xl:text-xl">
                {name || "Untitled route"}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-500 lg:flex">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span className="whitespace-nowrap">Auto-saved locally</span>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-orange-400 px-4 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-500 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {saving ? "Saving..." : id ? "Update" : "Save"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6">
        {formError && (
          <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-red-700">Please check your route</p>
              <p className="mt-0.5 text-xs text-red-600">{formError}</p>
            </div>
            <button
              type="button"
              onClick={() => setFormError("")}
              className="shrink-0 text-red-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="grid items-stretch gap-5 lg:grid-cols-2 xl:grid-cols-[minmax(300px,340px)_minmax(0,2fr)_minmax(300px,340px)] 2xl:grid-cols-[minmax(340px,380px)_minmax(0,2fr)_minmax(340px,380px)]">
          <PlannerCard className="order-2 flex h-full min-w-0 flex-col lg:order-1">
            <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <MapPinned className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500 xl:text-[11px]">
                    Route builder
                  </p>
                  <div className="flex min-w-0 items-center gap-2">
                    <h2 className="truncate text-base font-black xl:text-lg">
                      Destination stops
                    </h2>
                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500 xl:text-xs">
                      {stops.length}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddStop(true)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-orange-400 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-orange-500 xl:text-sm"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            <div className="mt-4 min-w-0 flex-1 overflow-y-auto pr-1 text-sm text-[#242222] xl:min-h-0 xl:text-[0.95rem]">
              {stops.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setShowAddStop(true)}
                  className="flex w-full items-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-left transition hover:border-orange-300 hover:bg-orange-50 sm:px-5 sm:py-7"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black xl:text-base">
                      Add your first destination
                    </p>
                    <p className="mt-1 text-xs text-gray-500 xl:text-sm">
                      Search for a place to begin your route.
                    </p>
                  </div>
                </button>
              ) : (
                <StopList />
              )}
            </div>
          </PlannerCard>

          <section className="order-1 flex min-w-0 flex-col overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-xl shadow-gray-200/40 lg:order-2 lg:col-span-2 xl:col-span-1">
            <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <MapPinned className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500 xl:text-[11px]">
                    Route preview
                  </p>
                  <h2 className="truncate text-base font-black xl:text-lg">
                    Interactive map
                  </h2>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {routeLoading && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-2 text-[11px] font-bold text-gray-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span className="hidden sm:inline">Updating</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-orange-50 px-3 py-2 text-[11px] font-bold text-orange-600 xl:text-xs">
                  <Navigation className="h-3.5 w-3.5" />
                  {stops.length} stop{stops.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="relative h-[55dvh] min-h-[360px] sm:h-[60dvh] sm:min-h-[440px] lg:h-[560px] xl:h-[620px]">
              <MapView
                locations={stops.map((stop) => ({
                  id: stop.id,
                  name: stop.name,
                  address: stop.address,
                  latitude: stop.latitude,
                  longitude: stop.longitude,
                  photos: [],
                }))}
                center={center}
                zoom={12}
                polyline={polyline}
                showNumbers
              />

              {stops.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#242222]/10 p-4">
                  <div className="w-full max-w-xs rounded-3xl bg-white/95 p-5 text-center shadow-2xl backdrop-blur">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                      <Compass className="h-7 w-7" />
                    </div>
                    <h3 className="mt-4 text-lg font-black">Build your route</h3>
                    <p className="mt-2 text-xs leading-5 text-gray-500 sm:text-sm">
                      Add your first destination to begin.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowAddStop(true)}
                className="absolute bottom-4 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-2 rounded-xl bg-orange-400 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-500 sm:left-4 sm:translate-x-0 sm:text-sm"
              >
                <Plus className="h-4 w-4" />
                Add stop
              </button>

              {stops.length > 0 && (
                <div className="absolute bottom-16 left-4 right-4 sm:right-auto sm:bottom-4">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#242222] text-white">
                      <Route className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 sm:max-w-[230px] xl:max-w-[320px]">
                      <p className="truncate text-xs font-black xl:text-sm">
                        {stops[0]?.name}
                        {stops.length > 1 &&
                          ` → ${stops[stops.length - 1]?.name}`}
                      </p>
                      <p className="mt-0.5 text-[10px] text-gray-500 xl:text-xs">
                        Live route preview
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-gray-100 px-4 py-3 sm:px-5">
              <p className="min-w-0 text-xs text-gray-500 xl:text-sm">
                Route updates automatically as stops change.
              </p>
              <button
                type="button"
                onClick={() => setShowAddStop(true)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-600 transition hover:bg-orange-100"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add stop</span>
              </button>
            </div>
          </section>

          <div className="order-3 flex min-w-0 flex-col gap-5 lg:col-span-2 xl:col-span-1 xl:flex xl:flex-col">
            <PlannerCard className="min-w-0">
              <CompactHeader icon={ImagePlus} eyebrow="Visual" title="Cover photo" />
              <div className="mt-4">
                {coverPreview ? (
                  <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/95 px-3 py-2 text-[10px] font-bold text-[#242222] xl:text-xs">
                        <Upload className="h-3.5 w-3.5 text-orange-500" />
                        Change
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={removeCover}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/40 text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex aspect-[16/10] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center transition hover:border-orange-300 hover:bg-orange-50">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                      <ImagePlus className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-xs font-black xl:text-sm">Upload cover</p>
                    <p className="mt-1 text-[10px] text-gray-500 xl:text-xs">
                      Add a scenic route photo
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </PlannerCard>

            <PlannerCard className="min-w-0">
              <CompactHeader icon={Navigation} eyebrow="Information" title="Trip details" />
              <div className="mt-4 space-y-3">
                <div>
                  <SmallLabel>Title</SmallLabel>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ride to Infanta"
                    className={compactInput}
                  />
                </div>
                <div>
                  <SmallLabel>Description</SmallLabel>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="What makes this route special?"
                    className={`${compactTextarea} resize-none`}
                  />
                </div>
              </div>
            </PlannerCard>

            <PlannerCard className="min-w-0 lg:col-span-2 xl:col-span-1">
              <CompactHeader icon={Route} eyebrow="Overview" title="Route summary" />
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-2">
                <MiniStat icon={MapPinned} label="Stops" value={String(stops.length)} />
                <MiniStat icon={Clock3} label="Time" value={estimatedTime || "—"} />
                <MiniStat
                  icon={Route}
                  label="Distance"
                  value={totalDistance ? `${totalDistance} km` : "—"}
                />
                <MiniStat icon={Mountain} label="Level" value={difficulty || "—"} />
              </div>

              <div className="mt-3 flex items-start gap-2 rounded-xl bg-orange-50 px-3 py-2.5">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                <p className="min-w-0 text-[11px] leading-4 text-orange-700 xl:text-xs xl:leading-5">
                  Public routes can be discovered and reviewed by other riders.
                </p>
              </div>
            </PlannerCard>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 p-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mx-auto flex h-12 w-full max-w-2xl items-center justify-center gap-2 rounded-xl bg-orange-400 text-sm font-black text-white shadow-lg disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : id ? "Update route" : "Save route"}
        </button>
      </div>

      {showAddStop && (
        <AddStopModal
          onClose={() => setShowAddStop(false)}
          onAdd={(stop) => {
            addStop(stop);
            setShowAddStop(false);
            setFormError("");
          }}
        />
      )}
    </div>
  );
}

const compactInput =
  "h-11 w-full min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-[#242222] outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100";

const compactTextarea =
  "w-full min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-[#242222] outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100";

function PlannerCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[1.6rem] border border-gray-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}
    >
      {children}
    </section>
  );
}

function CompactHeader({
  icon: Icon,
  eyebrow,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500 xl:text-[11px]">
          {eyebrow}
        </p>
        <h2 className="mt-0.5 truncate text-base font-black xl:text-lg">{title}</h2>
      </div>
    </div>
  );
}

function SmallLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500 xl:text-[11px]">
      {children}
    </label>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-gray-100 bg-gray-50 p-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500 xl:text-[11px]">
          {label}
        </p>
        <Icon className="h-3.5 w-3.5 shrink-0 text-orange-500" />
      </div>
      <p className="mt-2 truncate text-sm font-black xl:text-base">{value}</p>
    </div>
  );
}