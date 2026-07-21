import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { loginUser } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import { LogIn } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setUser } = useAuthStore();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await loginUser({ email, password });
            setUser(res.data.user);
            navigate(redirectTo, { replace: true });
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="min-h-[calc(100vh-3rem)] flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
                <div className="flex items-center gap-2 mb-6">
                    <LogIn className="w-6 h-6 text-indigo-600" />
                    <h1 className="text-2xl font-bold">Sign in to TrailPin</h1>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            required className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            required className="w-full border rounded px-3 py-2" />
                    </div>
                    <button type="submit"
                        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition">
                        Log In
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <a href="/api/auth/google" className="text-indigo-600 hover:underline">
                        Sign in with Google
                    </a>
                </div>
                <p className="mt-4 text-sm text-center text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-indigo-600 hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
}