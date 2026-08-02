import {
  Search,
  MapPin,
  Users,
  Route,
} from "lucide-react";
import { getPublicItineraries } from '../api/itinerary';
import { useAuthStore } from "../stores/authStore";
import { useDestinationStore } from "../stores/destinationStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DestinationFormModal from '../components/destination/DestinationFormModal';
import ItineraryCard from '../components/itinerary/ItineraryCard';
import type { Destination } from "../api/destination";

export default function Dashboard() {
  const {
    destinations,
    fetchDestinations,
  } = useDestinationStore();
  const { fetchUsers, users, user } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [itineraries, setItineraries] = useState<any[]>([]);

  useEffect(() => {
    fetchDestinations();
    fetchUsers();
    getPublicItineraries()
      .then(res => setItineraries(res.data))
      .catch(console.error);
  }, []);

  const userCount = users.length;
  const destCount = destinations.length;

  // Open destination form (only if logged in)
  const openDestinationForm = (mode: 'add' | 'edit', destination?: Destination) => {
    if (!user) {
      navigate('/login?redirect=/dashboard');
      return;
    }
    setModalMode(mode);
    setSelectedDestination(destination || null);
    setShowModal(true);
  };

  return (
    <div className="bg-gray-100 min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* HERO */}
        <div className="bg-gradient-to-r from-[#242222] to-[#373434] rounded-3xl p-10 text-white shadow-xl">
          <p className="text-orange-400 font-semibold">
            Welcome Back Rider 👋
          </p>
          <h1 className="text-5xl font-black mt-2">
            Discover, Plan & Share Epic Road Trips
          </h1>
          <p className="text-gray-300 mt-4 max-w-xl">
            Explore community-curated motorcycle itineraries complete with interactive map waypoints, pavement ratings, rider arrival notes, and instant .GPX exports for your GPS.
          </p>

          {/* Search */}
          <div className="bg-white rounded-full mt-8 flex items-center p-2 w-full">
            <Search className="text-gray-500 ml-4" />
            <input
              type="text"
              placeholder="Search destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 outline-none text-black"
            />
          </div>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-5 mt-8">
          <div className="bg-white rounded-2xl p-6 shadow">
            <Users className="text-orange-400 mb-3" />
            <h2 className="text-3xl font-bold">{userCount}</h2>
            <p className="text-gray-500">Community Riders</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <MapPin className="text-orange-400 mb-3" />
            <h2 className="text-3xl font-bold">{destCount}</h2>
            <p className="text-gray-500">Destinations</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <Route className="text-orange-400 mb-3" />
            <h2 className="text-3xl font-bold">{itineraries.length}</h2>
            <p className="text-gray-500">Routes Shared</p>
          </div>
        </div>

        {/* ITINERARIES SECTION */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">🗺️ Community Itineraries</h2>
            <button
              onClick={() => navigate('/itineraries')}
              className="text-orange-500 font-semibold text-sm hover:underline"
            >
              View All
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.slice(0, 6).map((itin) => (
              <ItineraryCard key={itin.id} itinerary={itin} />
            ))}
          </div>
        </div>

        {/* Optional: small button to add a single destination */}
        <div className="mt-8 text-center">
          <button
            onClick={() => openDestinationForm('add')}
            className="text-sm text-gray-500 hover:text-indigo-600 underline"
          >
            or add a single destination
          </button>
        </div>

        {/* Floating Button – goes to itinerary planner */}
        <button
          onClick={() => {
            if (!user) {
              navigate('/login?redirect=/itineraries/new');
            } else {
              navigate('/itineraries/new');
            }
          }}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-orange-400 hover:bg-orange-500 text-white text-3xl shadow-2xl transition"
        >
          +
        </button>
      </div>

      {/* Destination form modal – only when logged in */}
      {showModal && user && (
        <DestinationFormModal
          mode={modalMode}
          destination={selectedDestination}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}