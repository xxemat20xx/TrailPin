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
  Plus,
  Save,
  Route,
  Clock3,
  MapPinned,
  Mountain,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function ItineraryPlanner() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    name,
    description,
    coverPhoto,
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
  const [polyline, setPolyline] = useState<any>(null);
  const [showAddStop, setShowAddStop] = useState(false);

  useEffect(() => {
    if (stops.length < 2) {
      setPolyline(null);
      return;
    }
    calculateRoute(
      stops.map((s) => ({ lat: s.latitude, lng: s.longitude }))
    )
      .then((res) => setPolyline(JSON.parse(res.data.polyline)))
      .catch(console.error);
  }, [stops]);

  useEffect(() => {
    if (!id) {
      clear();
      return;
    }
    getItinerary(id)
      .then((res) => {
        const it = res.data;
        setName(it.name);
        setDescription(it.description || "");
        setCoverPhoto(it.coverPhoto || "");
        setEstimatedTime(it.estimatedTime || "");
        setTotalDistance(it.totalDistance);
        setDifficulty(it.difficulty || "Easy");
        setTags(it.tags || []);
        setVisibility(it.visibility || "public");
        useItineraryStore.setState({
          stops: it.stops.map((s: any) => ({
            id: crypto.randomUUID(),
            name: s.name,
            latitude: s.latitude,
            longitude: s.longitude,
            address: s.address,
            description: s.description,
            arrivalNotes: s.arrivalNotes,
            estimatedStay: s.estimatedStay,
          })),
        });
      })
      .catch(console.error);
  }, [id]);

  async function handleSave() {
    if (!name.trim() || stops.length === 0) {
      alert("Please enter a title and at least one stop.");
      return;
    }
    setSaving(true);
    const payload = {
      name,
      description,
      coverPhoto,
      estimatedTime,
      totalDistance,
      difficulty,
      tags,
      visibility,
      stops: stops.map((s, index) => ({
        order: index + 1,
        name: s.name,
        latitude: s.latitude,
        longitude: s.longitude,
        address: s.address,
        description: s.description,
        arrivalNotes: s.arrivalNotes,
        estimatedStay: s.estimatedStay,
      })),
    };
    try {
      if (id) {
        await updateItinerary(id, payload);
        navigate(`/itineraries/${id}`);
      } else {
        const res = await createItinerary(payload);
        navigate(`/itineraries/${res.data.id}`);
      }
    } finally {
      setSaving(false);
    }
  }

  const center: [number, number] = useMemo(() => {
    if (!stops.length) return [14.6, 121.0];
    return [stops[0].latitude, stops[0].longitude];
  }, [stops]);

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900">
      {/* LEFT — MAP */}
      <section className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white/80 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                {id ? "Editing" : "New trip"}
              </p>
              <h1 className="text-lg font-semibold tracking-tight text-neutral-900">
                {name || (id ? "Untitled itinerary" : "Plan a new itinerary")}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Auto-saved
            </span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" strokeWidth={2.2} />
              )}
              {saving ? "Saving" : id ? "Update trip" : "Save trip"}
            </button>
          </div>
        </header>

        {/* Map */}
        <div className="relative flex-1 p-4">
          <div className="relative h-full overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-200">
            <MapView
              locations={stops.map((s) => ({
                id: s.id,
                name: s.name,
                address: s.address,
                latitude: s.latitude,
                longitude: s.longitude,
                photos: [],
              }))}
              center={center}
              zoom={12}
              polyline={polyline}
              showNumbers
            />

            {stops.length === 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="pointer-events-auto max-w-xs rounded-xl border border-neutral-200 bg-white/95 px-5 py-4 text-center shadow-lg backdrop-blur">
                  <MapPinned className="mx-auto mb-2 h-5 w-5 text-neutral-400" />
                  <p className="text-sm font-medium text-neutral-900">
                    No stops yet
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Add your first stop to preview the route on the map.
                  </p>
                  <button
                    onClick={() => setShowAddStop(true)}
                    className="mt-3 inline-flex items-center gap-1 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add stop
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* RIGHT — SIDEBAR */}
      <aside className="flex w-[420px] flex-col border-l border-neutral-200 bg-white">
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <StatCard icon={Route} label="Stops" value={String(stops.length)} />
            <StatCard
              icon={Clock3}
              label="Duration"
              value={estimatedTime || "—"}
            />
            <StatCard
              icon={MapPinned}
              label="Distance"
              value={totalDistance ? String(totalDistance) : "—"}
            />
            <StatCard
              icon={Mountain}
              label="Difficulty"
              value={difficulty || "—"}
            />
          </div>

          {/* Trip details */}
          <Section title="Trip details">
            <FieldLabel>Trip title</FieldLabel>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ride to Infanta Quezon"
              className={inputCls}
            />

            <div className="mt-4">
              <FieldLabel>Description</FieldLabel>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share your trip details, notes, or tips for others."
                className={`${inputCls} resize-none`}
              />
            </div>
          </Section>

          {/* Stops */}
          <Section
            title="Stops"
            count={stops.length}
            action={
              <button
                onClick={() => setShowAddStop(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            }
          >
            {stops.length === 0 ? (
              <button
                onClick={() => setShowAddStop(true)}
                className="flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50 px-4 py-8 text-center transition hover:border-neutral-400 hover:bg-neutral-50"
              >
                <div className="rounded-lg bg-white p-2 ring-1 ring-neutral-200">
                  <Plus className="h-4 w-4 text-neutral-600" />
                </div>
                <p className="text-sm font-medium text-neutral-900">
                  Add your first stop
                </p>
                <p className="text-xs text-neutral-500">
                  Search a place to begin building the route.
                </p>
              </button>
            ) : (
              <StopList />
            )}
          </Section>
        </div>

        {/* Sticky footer */}
        <div className="border-t border-neutral-200 bg-white px-6 py-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" strokeWidth={2.2} />
            )}
            {saving ? "Saving…" : id ? "Update trip" : "Save trip"}
          </button>
        </div>
      </aside>

      {showAddStop && (
        <AddStopModal
          onClose={() => setShowAddStop(false)}
          onAdd={(stop) => {
            addStop(stop);
            setShowAddStop(false);
          }}
        />
      )}
    </div>
  );
}

/* ---------- helpers ---------- */

const inputCls =
  "w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-500">
      {children}
    </label>
  );
}

function Section({
  title,
  count,
  action,
  children,
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
            {title}
          </h2>
          {typeof count === "number" && (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
              {count}
            </span>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3.5 transition hover:border-neutral-300">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
          {label}
        </p>
        <Icon className="h-3.5 w-3.5 text-neutral-400" />
      </div>
      <p className="mt-2 text-lg font-semibold tracking-tight text-neutral-900">
        {value}
      </p>
    </div>
  );
}
