import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import React from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuthStore();

    if (isLoading) return <div className="flex justify-center p-8">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}