import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api'; // using direct api service for this potentially, or store
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const VerifyEmail: React.FC = () => {
    // We might need to use hash router params or search params depending on how the link is constructed.
    // implementation_plan said: /verify/:token
    // But we are using HashRouter probably? 
    // Link was: `http://localhost:3000/#/verify/${token}`

    // In HashRouter, we can't easily use params if the route isn't set up.
    // We added the file but not the route in App.tsx yet.

    // Let's assume we will add the route path="/verify/:token"
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMsg('No token provided');
            return;
        }

        const verify = async () => {
            try {
                const res = await api.verifyEmail(token);
                // Assuming api.verifyEmail returns { token, user } on success
                // We could auto-login the user here using localStorage
                if (res.token) {
                    api.setToken(res.token);
                    // We might not update StoreContext state immediately unless we reload or explicit call.
                    // But user can just click "Continue to Dashboard"
                }
                setStatus('success');
            } catch (err: any) {
                setStatus('error');
                setMsg(err.message || 'Verification failed');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 text-center">

                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mb-4" />
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Verifying...</h2>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Email Verified!</h2>
                        <p className="text-slate-500 mb-6">Your account is now active.</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-indigo-500/30"
                        >
                            Continue to Dashboard
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="w-16 h-16 text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verification Failed</h2>
                        <p className="text-slate-500 mb-6">{msg}</p>
                        <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                            Back to Login
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
};

export default VerifyEmail;
