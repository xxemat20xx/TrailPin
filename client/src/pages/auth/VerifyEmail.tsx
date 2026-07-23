import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../../api/auth";
import {
    CheckCircle2,
    XCircle,
    Loader2,
    MapPin,
    Mountain,
} from "lucide-react";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const [status, setStatus] = useState<
        "loading" | "success" | "error"
    >("loading");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            return;
        }

        verifyEmail(token)
            .then(() => setStatus("success"))
            .catch(() => setStatus("error"));
    }, [token]);

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
                        <MapPin className="w-9 h-9 text-orange-400" />

                        <h1 className="text-4xl font-black">
                            TrailPin
                        </h1>
                    </div>

                    <h2 className="text-5xl font-black leading-tight">
                        One Step Away
                        <br />
                        From Adventure.
                    </h2>

                    <p className="mt-6 text-lg text-gray-300 leading-8">
                        Verify your account to unlock destinations,
                        share motorcycle routes, and connect with riders
                        across the country.
                    </p>

                    <div className="flex gap-10 mt-12">
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

                <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center">

                    <div className="mx-auto w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-6">
                        <Mountain className="text-orange-500 w-10 h-10" />
                    </div>

                    {/* LOADING */}

                    {status === "loading" && (
                        <>
                            <Loader2 className="w-14 h-14 animate-spin text-orange-500 mx-auto mb-6" />

                            <h2 className="text-3xl font-black text-gray-800">
                                Verifying Email
                            </h2>

                            <p className="mt-4 text-gray-500 leading-7">
                                Please wait while we verify your account.
                            </p>
                        </>
                    )}

                    {/* SUCCESS */}

                    {status === "success" && (
                        <>
                            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />

                            <h2 className="text-3xl font-black text-gray-800">
                                Email Verified!
                            </h2>

                            <p className="mt-4 text-gray-500 leading-7">
                                Your TrailPin account has been successfully
                                verified.
                            </p>

                            <p className="mt-2 text-gray-500">
                                You can now sign in and begin sharing your
                                motorcycle adventures.
                            </p>

                            <Link
                                to="/login"
                                className="mt-8 inline-flex items-center justify-center w-full bg-orange-400 hover:bg-orange-500 text-white py-4 rounded-xl font-semibold transition"
                            >
                                Continue to Login
                            </Link>
                        </>
                    )}

                    {/* ERROR */}

                    {status === "error" && (
                        <>
                            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />

                            <h2 className="text-3xl font-black text-gray-800">
                                Verification Failed
                            </h2>

                            <p className="mt-4 text-gray-500 leading-7">
                                This verification link is invalid or has
                                expired.
                            </p>

                            <p className="mt-2 text-gray-500">
                                You can request a new verification email by
                                signing in again.
                            </p>

                            <Link
                                to="/register"
                                className="mt-8 inline-flex items-center justify-center w-full border border-orange-400 text-orange-500 hover:bg-orange-50 py-4 rounded-xl font-semibold transition"
                            >
                                Back to Registration
                            </Link>
                        </>
                    )}

                </div>

            </div>

        </div>
    );
}