import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { loginUser } from "../../api/auth";
import { useAuthStore } from "../../stores/authStore";
import {
    LogIn,
    Mail,
    Lock,
    MapPin,

    Mountain,
} from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { setUser } = useAuthStore();
    const [searchParams] = useSearchParams();

    const redirectTo = searchParams.get("redirect") || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");

        try {
            const res = await loginUser({
                email,
                password,
            });

            setUser(res.data.user);

            navigate(redirectTo, {
                replace: true,
            });
        } catch (err: any) {
            setError(err.response?.data?.error || "Login failed");
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-gray-100">

            {/* LEFT PANEL */}
            <div
                className="hidden lg:flex relative items-center justify-center bg-cover bg-center"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600')",
                }}
            >
                <div className="absolute inset-0 bg-black/60"></div>

                <div className="relative z-10 text-white max-w-md px-10">
                    <div className="flex items-center gap-3 mb-8">
                        <MapPin className="text-orange-400 w-9 h-9" />

                        <h1 className="text-4xl font-black">
                            TrailPin
                        </h1>
                    </div>

                    <h2 className="text-5xl font-black leading-tight">
                        Every Ride
                        <br />
                        Tells a Story.
                    </h2>

                    <p className="mt-6 text-lg text-gray-300 leading-8">
                        Discover hidden destinations, share your adventures,
                        and connect with riders all over the Philippines.
                    </p>

                    <div className="flex gap-8 mt-12">
                        <div>
                            <h3 className="text-3xl font-bold text-orange-400">
                                500+
                            </h3>

                            <p className="text-gray-300">
                                Destinations
                            </p>
                        </div>

                        <div>
                            <h3 className="text-3xl font-bold text-orange-400">
                                1,200+
                            </h3>

                            <p className="text-gray-300">
                                Riders
                            </p>
                        </div>

                        <div>
                            <h3 className="text-3xl font-bold text-orange-400">
                                900+
                            </h3>

                            <p className="text-gray-300">
                                Routes
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex items-center justify-center p-6">

                <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">

                    <div className="text-center">

                        <div className="mx-auto w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-5">

                            <Mountain className="text-orange-500 w-10 h-10" />

                        </div>

                        <h2 className="text-4xl font-black text-gray-800">
                            Welcome Back
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Sign in to continue your adventure.
                        </p>

                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-300 text-red-600 rounded-xl p-3 mt-8 text-sm">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5 mt-8"
                    >

                        <div>

                            <label className="text-sm font-semibold text-gray-600">
                                Email
                            </label>

                            <div className="mt-2 flex items-center border rounded-xl px-4">

                                <Mail className="text-gray-400 w-5 h-5" />

                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full px-3 py-4 outline-none"
                                />

                            </div>

                        </div>

                        <div>

                            <label className="text-sm font-semibold text-gray-600">
                                Password
                            </label>

                            <div className="mt-2 flex items-center border rounded-xl px-4">

                                <Lock className="text-gray-400 w-5 h-5" />

                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-3 py-4 outline-none"
                                />

                            </div>

                        </div>

                        <button
                            type="submit"
                            className="w-full bg-orange-400 hover:bg-orange-500 text-white py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                        >
                            <LogIn className="w-5 h-5" />

                            Sign In
                        </button>

                    </form>

                    <div className="my-8 flex items-center">

                        <div className="flex-1 h-px bg-gray-300"></div>

                        <span className="px-4 text-gray-400 text-sm">
                            OR
                        </span>

                        <div className="flex-1 h-px bg-gray-300"></div>

                    </div>

                    <a
                        href="/api/auth/google"
                        className="border rounded-xl py-4 flex items-center justify-center gap-3 hover:bg-gray-100 transition"
                    >


                        Continue with Google
                    </a>

                    <p className="text-center mt-8 text-gray-500">

                        Don't have an account?

                        <Link
                            to="/register"
                            className="ml-2 text-orange-500 font-semibold hover:text-orange-600"
                        >
                            Create Account
                        </Link>

                    </p>

                </div>

            </div>
        </div>
    );
}