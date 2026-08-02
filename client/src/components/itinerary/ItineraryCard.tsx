import { MapPin, Clock, Route } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ItineraryCardProps {
  itinerary: any; // replace with your Itinerary type later
}

export default function ItineraryCard({ itinerary }: ItineraryCardProps) {
  const navigate = useNavigate();
  const stops = itinerary.stops || [];
  const coverPhoto =
    itinerary.coverPhoto ||
    stops[0]?.photos?.[0]?.url ||
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200";

  return (
    <div
      onClick={() => navigate(`/itineraries/${itinerary.id}`)}
      className="group cursor-pointer rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={coverPhoto}
          alt={itinerary.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {itinerary.difficulty && (
          <span className="absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
            {itinerary.difficulty}
          </span>
        )}
      </div>
      <div className="p-5 space-y-3">
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {itinerary.name}
        </h3>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-indigo-400" />
            <span>{stops.length} stops</span>
          </div>
          {itinerary.estimatedTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>{itinerary.estimatedTime}</span>
            </div>
          )}
          {itinerary.totalDistance && (
            <div className="flex items-center gap-1">
              <Route className="w-4 h-4 text-indigo-400" />
              <span>{itinerary.totalDistance.toFixed(1)} km</span>
            </div>
          )}
        </div>
        {itinerary.user?.name && (
          <p className="text-xs text-slate-400">
            by {itinerary.user.name}
          </p>
        )}
        <div className="pt-2">
          <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 group-hover:bg-indigo-100 transition-colors">
            View Route
          </span>
        </div>
      </div>
    </div>
  );
}