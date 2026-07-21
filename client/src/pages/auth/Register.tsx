import { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerUser } from '../../api/auth';
import { UserPlus } from 'lucide-react';

export default function Register() {
    const [form, setForm] = useState({ email: '', password: '', name: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await registerUser(form);
            setMessage('Registration successful! Check your email to verify your account.');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <div className="flex items-center gap-2 mb-6">
                    <UserPlus className="w-6 h-6 text-indigo-600" />
                    <h1 className="text-2xl font-bold">Create an Account</h1>
                </div>
                {message && <p className="text-green-600 text-sm mb-4">{message}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
                    >
                        Register
                    </button>
                </form>
                <p className="mt-4 text-sm text-center">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-600 hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}