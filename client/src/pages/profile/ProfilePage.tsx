import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../../api/profile';
import { useAuthStore } from '../../stores/authStore';
import { Pen, Check, X, MapPin, Heart, Route } from 'lucide-react';
import ItineraryCard from '../../components/itinerary/ItineraryCard'; // adjust path

export default function ProfilePage() {
  const { user, setUser, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    if(isLoading) return; // wait until auth state is loaded
    if (!user) {
      navigate('/login?redirect=/profile');
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      setProfile(res.data);
      setNewUsername(res.data.user.username || '');
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUsername = async () => {
    setUpdateError('');
    try {
      const res = await updateProfile({ username: newUsername });
      setProfile((prev: any) => ({ ...prev, user: res.data }));
      setUser(res.data); // update auth store
      setEditingUsername(false);
    } catch (err: any) {
      setUpdateError(err.response?.data?.error || 'Failed to update username');
    }
  };

  if (loading) return <div className="min-h-screen py-24 text-center">Loading profile...</div>;
  if (!profile) return <div className="min-h-screen py-24 text-center">Profile not found</div>;

  const { user: profileUser, stats, itineraries } = profile;

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-sm p-8 mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <img
              src={profileUser.avatar || 'https://via.placeholder.com/80'}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover ring-4 ring-orange-100"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-black text-gray-900">
                {profileUser.name || 'Rider'}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-gray-500 text-sm">
                  @{profileUser.username || 'username'}
                </span>
                {editingUsername ? (
                  <div className="flex items-center gap-1">
                    <input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-40"
                      placeholder="username"
                    />
                    <button onClick={handleSaveUsername} className="text-green-600">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingUsername(false)} className="text-gray-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingUsername(true)}
                    className="text-gray-400 hover:text-indigo-600"
                    title="Edit username"
                  >
                    <Pen className="w-4 h-4" />
                  </button>
                )}
              </div>
              {updateError && <p className="text-red-500 text-xs mt-1">{updateError}</p>}
              <p className="text-gray-500 text-sm mt-2">{profileUser.email}</p>
            </div>

            {/* Stats */}
            <div className="flex gap-8">
              <div className="text-center">
                <Route className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                <p className="text-2xl font-black text-gray-900">{stats.itinerariesCount}</p>
                <p className="text-xs text-gray-500">Itineraries</p>
              </div>
              <div className="text-center">
                <Heart className="w-6 h-6 text-red-500 mx-auto mb-1" />
                <p className="text-2xl font-black text-gray-900">{stats.totalUpvotes}</p>
                <p className="text-xs text-gray-500">Upvotes</p>
              </div>
            </div>
          </div>
        </div>

        {/* User's Itineraries */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Shared Routes</h2>
        {itineraries.length === 0 ? (
          <p className="text-gray-500">You haven't created any itineraries yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map((itin: any) => (
              <ItineraryCard key={itin.id} itinerary={itin} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}