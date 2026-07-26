import {
  Search,
  MapPin,
  Clock3,
  Users,
  Route,
  Heart,
  MessageCircle,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useDestinationStore } from "../stores/destinationStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DestinationFormModal from '../components/destination/DestinationFormModal';
import type { Destination } from "../api/destination";
import DashboardCommunityCard from '../components/dashboard/DashboardCommunityCard';

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


  useEffect(() => {
    fetchDestinations();
    fetchUsers();
  }, []);



  const userCount = users.length;
  const destCount = destinations.length;

  const handleAddDestination = () => {
    if (!user) {
      navigate('/login?redirect=/dashboard');
      return;
    }
    setModalMode('add');
    setSelectedDestination(null);
    setShowModal(true);
  }

  return (
    <div className="bg-gray-100 min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* HERO */}
        <div className="bg-gradient-to-r from-[#242222] to-[#373434] rounded-3xl p-10 text-white shadow-xl">
          <p className="text-orange-400 font-semibold">
            Welcome Back Rider 👋
          </p>

          <h1 className="text-5xl font-black mt-2">
            Where are you riding today?
          </h1>

          <p className="text-gray-300 mt-4 max-w-xl">
            Discover beautiful motorcycle routes shared by the community and
            start your next adventure.
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
            <h2 className="text-3xl font-bold">890</h2>
            <p className="text-gray-500">Routes Shared</p>
          </div>
        </div>

        {/* Featured */}
        {/* <div className="mt-12">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-3xl font-bold">
              🔥 Featured Destinations
            </h2>

            <button className="text-orange-500 font-semibold">
              View All
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {destinations.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl shadow hover:shadow-xl transition overflow-hidden"
              >
                <img
                  src={item.image}
                  className="h-56 w-full object-cover"
                />

                <div className="p-6">
                  <h3 className="text-2xl font-bold">
                    {item.title}
                  </h3>

                  <p className="text-gray-500 mt-2">
                    {item.description}
                  </p>

                  <div className="flex justify-between mt-6 text-sm text-gray-600">
                    <span>📍 {item.distance}</span>

                    <span>🕒 {item.duration}</span>
                  </div>

                  <button className="mt-6 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-semibold">
                    View Itinerary
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* COMMUNITY */}
        <DashboardCommunityCard
          destinations={destinations}
          searchQuery={searchQuery}

        />

        {/* Floating Button */}
        <button onClick={() => handleAddDestination()}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-orange-400 hover:bg-orange-500 text-white text-3xl shadow-2xl transition">
          +
        </button>


      </div>

      {showModal && (
        <DestinationFormModal
          mode={modalMode}
          destination={selectedDestination}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}