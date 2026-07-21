import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from "../stores/authStore";
import { LogIn, UserPlus, LogOut, MapPin } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-sm border-b px-4 py-2 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
                <MapPin className="w-6 h-6" />
                TrailPin
            </Link>
            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <span className="text-sm text-gray-700">{user.name || user.email}</span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600"
                        >
                            <LogIn className="w-4 h-4" />
                            Log in
                        </Link>
                        <Link
                            to="/register"
                            className="flex items-center gap-1 text-sm text-white bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-700"
                        >
                            <UserPlus className="w-4 h-4" />
                            Sign up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}