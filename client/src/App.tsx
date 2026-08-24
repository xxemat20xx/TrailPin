import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./stores/authStore";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Dashboard from "./pages/Dashboard";

import MainLayout from "./layouts/MainLayout";

import ItineraryPlanner from "./pages/itineraries/ItineraryPlanner";
import ItineraryDetail from "./pages/itineraries/ItineraryDetails";

import ProfilePage from "./pages/profile/ProfilePage";
import MyItineraries from './pages/itineraries/MyItineraries';

import Forum from './pages/forum/Forum';
import StopPhotos from './pages/StopPhotos';

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Routes>
      {/* Pages WITHOUT navbar */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/itineraries/new" element={<ItineraryPlanner />} />
      
      {/* Pages WITH navbar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/my-itineraries" element={<MyItineraries />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/itineraries/:id" element={<ItineraryDetail />} />
        <Route path="/stop-photos" element={<StopPhotos />} />

        <Route path="*" element={<div className="min-h-screen bg-gray-50 py-24 text-center"><p className="text-gray-500">404 - Page Not Found</p></div>} />
      </Route>
    </Routes>
  );
}

export default App;