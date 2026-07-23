import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../../api/auth";
import {
    UserPlus,
    User,
    Mail,
    Lock,
    MapPin,
    Mountain,
} from "lucide-react";

export default function Register() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");
        setMessage("");

        try {
            await registerUser(form);

            setMessage(
                "Registration successful! Please check your email to verify your account."
            );

            setForm({
                name: "",
                email: "",
                password: "",
            });
        } catch (err: any) {
            setError(err.response?.data?.error || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-gray-100">
            {/* LEFT PANEL */}
            <div
                className="hidden lg:flex relative items-center justify-center bg-cover bg-center"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1517846693594-1567da72af75?w=1600')",
                }}
            >
                <div className="absolute inset-0 bg-black/60" />

                <div className="relative z-10 max-w-md px-10 text-white">
                    <div className="flex items-center gap-3 mb-8">
                        <MapPin className="w-9 h-9 text-orange-400" />

                        <h1 className="text-4xl font-black">
                            TrailPin
                        </h1>
                    </div>

                    <h2 className="text-5xl font-black leading-tight">
                        Join the
                        <br />
                        Riding Community.
                    </h2>

                    <p className="mt-6 text-lg text-gray-300 leading-8">
                        Share your favorite motorcycle destinations, discover amazing
                        routes, and inspire fellow riders with every adventure.
                    </p>

                    <div className="flex gap-10 mt-12">
                        <div>
                            <h3 className="text-3xl font-bold text-orange-400">500+</h3>
                            <p className="text-gray-300">Destinations</p>
                        </div>

                        <div>
                            <h3 className="text-3xl font-bold text-orange-400">1,200+</h3>
                            <p className="text-gray-300">Members</p>
                        </div>

                        <div>
                            <h3 className="text-3xl font-bold text-orange-400">900+</h3>
                            <p className="text-gray-300">Trips Shared</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
                    <div className="text-center">
                        <div className="mx-auto w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-5">
                            <Mountain className="w-10 h-10 text-orange-500" />
                        </div>

                        <h2 className="text-4xl font-black text-gray-800">
                            Create Account
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Start sharing your motorcycle adventures.
                        </p>
                    </div>

                    {message && (
                        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 text-sm">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5 mt-8">
                        <div>
                            <label className="text-sm font-semibold text-gray-600">
                                Full Name
                            </label>

                            <div className="mt-2 flex items-center border rounded-xl px-4">
                                <User className="w-5 h-5 text-gray-400" />

                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="John Doe"
                                    className="w-full px-3 py-4 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-600">
                                Email
                            </label>

                            <div className="mt-2 flex items-center border rounded-xl px-4">
                                <Mail className="w-5 h-5 text-gray-400" />

                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            email: e.target.value,
                                        })
                                    }
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
                                <Lock className="w-5 h-5 text-gray-400" />

                                <input
                                    type="password"
                                    required
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            password: e.target.value,
                                        })
                                    }
                                    placeholder="••••••••"
                                    className="w-full px-3 py-4 outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-orange-400 hover:bg-orange-500 text-white py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                        >
                            <UserPlus className="w-5 h-5" />
                            Create Account
                        </button>
                    </form>

                    <p className="text-center mt-8 text-gray-500">
                        Already have an account?
                        <Link
                            to="/login"
                            className="ml-2 font-semibold text-orange-500 hover:text-orange-600"
                        >
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}