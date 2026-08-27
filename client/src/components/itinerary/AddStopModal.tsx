import { useState, useEffect, useRef } from "react";
import {
  X,
  Search,
  MapPin,
  CheckCircle2,
  Loader2,
  Plus,
  Navigation,
  Pencil,
} from "lucide-react";

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

interface Props {
  onAdd: (stop: { name: string; latitude: number; longitude: number; address: string }) => void;
  onUpdate?: (stop: { name: string; latitude: number; longitude: number; address: string }) => void;
  editStop?: { id: string; name: string; latitude: number; longitude: number; address: string } | null;
  onClose: () => void;
}

export default function AddStopModal({ onAdd, onUpdate, editStop, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Pre‑fill when editing
  useEffect(() => {
    if (editStop) {
      setName(editStop.name);
      setAddress(editStop.address);
      setLatitude(editStop.latitude);
      setLongitude(editStop.longitude);
      setQuery(editStop.address || ""); // optional: triggers search suggestions
    }
  }, [editStop]);

  useEffect(() => {
    if (query.trim().length < 3) {
      setPredictions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch("/api/places/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: query }),
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setPredictions(data);
          setShowSuggestions(true);
        }
      } finally {
        setIsSearching(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    const click = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, []);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

 function selectSuggestion(prediction: Prediction) {
  setShowSuggestions(false);
  setQuery(prediction.description);
  
  // Use the pre‑filled data from the autocomplete response
  setName(prediction.name || prediction.structured_formatting?.main_text || "");
  setAddress(prediction.address || "");
  setLatitude(prediction.latitude ?? null);
  setLongitude(prediction.longitude ?? null);
}

  function handleSubmit() {
    if (!name || latitude == null || longitude == null) return;
    const stopData = { name, address, latitude, longitude };
    if (editStop && onUpdate) {
      onUpdate(stopData);
    } else {
      onAdd(stopData);
    }
    onClose();
  }

  const isValid = name && latitude != null && longitude != null;
  const isEditing = !!editStop;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-neutral-950/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] ring-1 ring-neutral-200 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-100 px-6 pb-5 pt-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white">
              {isEditing ? <Pencil className="h-5 w-5" /> : <Navigation className="h-5 w-5" strokeWidth={2.2} />}
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
                {isEditing ? "Edit stop" : "Add a stop"}
              </h2>
              <p className="mt-0.5 text-sm text-neutral-500">
                {isEditing ? "Update the stop details." : "Search a destination or enter details manually."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          {/* Search */}
          <div ref={wrapperRef} className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search places, addresses, landmarks…"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5"
            />
            {isSearching && (
              <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-500" />
            )}

            {showSuggestions && predictions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-lg">
                {predictions.map((p) => (
                  <button
                    key={p.place_id}
                    onClick={() => selectSuggestion(p)}
                    className="flex w-full items-start gap-3 border-b border-neutral-100 px-4 py-3 text-left transition last:border-none hover:bg-neutral-50"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-900">
                        {p.structured_formatting?.main_text}
                      </p>
                      <p className="truncate text-xs text-neutral-500">
                        {p.structured_formatting?.secondary_text}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected */}
          {name && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200/70 bg-emerald-50/60 px-4 py-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-neutral-900">
                  {name}
                </p>
                {address && (
                  <p className="truncate text-xs text-neutral-600">{address}</p>
                )}
              </div>
            </div>
          )}

          {/* Inputs */}
          <div className="space-y-4">
            <Field label="Stop name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Central Park"
                className={inputCls}
              />
            </Field>

            <Field label="Address">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, city, country"
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude">
                <input
                  disabled
                  value={latitude ?? ""}
                  onChange={(e) =>
                    setLatitude(parseFloat(e.target.value) || null)
                  }
                  placeholder="0.0000"
                  className="*:w-full rounded-lg border border-neutral-200 bg-neutral-100 px-3.5 py-2.5 text-sm text-neutral-500 placeholder:text-neutral-400 outline-none"
                />
              </Field>
              <Field label="Longitude">
                <input
                  disabled
                  value={longitude ?? ""}
                  onChange={(e) =>
                    setLongitude(parseFloat(e.target.value) || null)
                  }
                  placeholder="0.0000"
                  className="*:w-full rounded-lg border border-neutral-200 bg-neutral-100 px-3.5 py-2.5 text-sm text-neutral-500 placeholder:text-neutral-400 outline-none"
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-neutral-100 bg-neutral-50/60 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
          >
            {isEditing ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Update stop
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                Add stop
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </label>
      {children}
    </div>
  );
}