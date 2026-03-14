'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGoogleLogin } from '@react-oauth/google';
import { PageWrapper, Card, Alert } from '@/components/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const isDev = process.env.NODE_ENV === 'development';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            setError('');

            try {
                const res = await fetch(`${API_URL}/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accessToken: tokenResponse.access_token }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Login failed');
                }

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                router.push('/dashboard');

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        },
        onError: () => setError('Google sign-in failed. Please try again.'),
    });

    return (
        <PageWrapper showNav={false}>
            <div className="min-h-screen flex flex-col md:flex-row">
                {/* Visual Side */}
                <div className="hidden md:flex w-full md:w-1/2 bg-mesh-dark relative items-center justify-center p-12 overflow-hidden">
                    {/* Ambient Orbs */}
                    <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[80px] animate-float" />
                    <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px] animate-float delay-500" />

                    <div className="relative z-10 w-full max-w-md text-white animate-fade-up">
                        <Link href="/" className="inline-flex items-center gap-3 mb-12 hover:-translate-y-1 transition-transform group">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
                                <img src="/logo.svg" alt="KIIT Wellness" className="w-8 h-8 object-contain brightness-0 invert" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">KIIT Wellness Space</span>
                        </Link>
                        <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-[1.1] tracking-tight">
                            Your secure space for self-reflection.
                        </h2>
                        <p className="text-lg text-indigo-100/80 font-medium leading-relaxed mb-12">
                            Take a moment to check in with yourself. A calm, private, and supportive environment designed for your mental wellbeing.
                        </p>

                        {/* Interactive Feature List */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-indigo-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">End-to-End Privacy</h4>
                                    <p className="text-sm text-indigo-200/70">Your reflections are encrypted</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">Dedicated Mentorship</h4>
                                    <p className="text-sm text-violet-200/70">Connect with human support</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white relative">
                    {/* Mobile Logo Header */}
                    <div className="md:hidden absolute top-6 left-6">
                        <Link href="/" className="flex items-center gap-2">
                            <img src="/logo.svg" alt="KIIT Wellness" className="w-8 h-8 rounded-lg shadow-sm" />
                            <span className="font-bold text-slate-800 tracking-tight">KIIT Wellness Space</span>
                        </Link>
                    </div>

                    <div className="w-full max-w-md mt-16 md:mt-0 animate-fade-up" style={{ animationDelay: '200ms' }}>
                        <div className="mb-10 text-center md:text-left">
                            <h1 className="text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">Welcome back</h1>
                            <p className="text-lg text-slate-500 font-medium">Log in to continue your journey</p>
                        </div>

                        {error && (
                            <div className="mb-8">
                                <Alert variant="danger">{error}</Alert>
                            </div>
                        )}

                        <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 shadow-sm mb-8">
                            <p className="text-slate-600 font-medium text-sm mb-6 text-center">
                                Sign in with your university email
                            </p>

                            {loading ? (
                                <div className="flex items-center justify-center py-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="ml-3 text-slate-700 font-medium tracking-wide">Signing in...</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => login()}
                                    disabled={loading}
                                    className="w-full py-4 px-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-700 font-semibold flex items-center justify-center gap-4 hover:bg-slate-50 hover:shadow-md transition-all disabled:opacity-50 hover:-translate-y-0.5"
                                >
                                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Continue with Google
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col items-center justify-center space-y-6">
                            <Link
                                href="/mentor/login"
                                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-semibold hover:bg-white hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm transition-all"
                            >
                                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Mentor Access
                            </Link>

                            <p className="text-sm font-medium text-slate-400">
                                Need support? Reach out to Counselling Services.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}
