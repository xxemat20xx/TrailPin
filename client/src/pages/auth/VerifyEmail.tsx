import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail } from '../../api/auth';
import { CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }
        verifyEmail(token)
            .then(() => setStatus('success'))
            .catch(() => setStatus('error'));
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow text-center max-w-md">
                {status === 'loading' && <p>Verifying your email...</p>}
                {status === 'success' && (
                    <>
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h1 className="text-xl font-bold">Email Verified!</h1>
                        <p className="mt-2 text-gray-600">You can now log in.</p>
                        <Link to="/login" className="text-indigo-600 hover:underline mt-4 inline-block">
                            Go to Login
                        </Link>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h1 className="text-xl font-bold">Verification Failed</h1>
                        <p className="mt-2 text-gray-600">Invalid or expired token.</p>
                    </>
                )}
            </div>
        </div>
    );
}