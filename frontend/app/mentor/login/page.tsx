'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageWrapper, Card, Alert, Button, Input } from '@/components/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function MentorLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('mentor@kiit.ac.in');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [devOtp, setDevOtp] = useState('');

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/auth/mentor/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send OTP');
            }

            if (data.devOtp) {
                setDevOtp(data.devOtp);
            }

            setStep('OTP');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/auth/mentor/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Invalid OTP');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            router.push('/mentor/dashboard');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper showNav={false}>
            <div className="min-h-screen flex flex-col md:flex-row-reverse">
                {/* Visual Side */}
                <div className="hidden md:flex w-full md:w-1/2 bg-mesh-dark relative items-center justify-center p-12 overflow-hidden">
                    {/* Ambient Orbs */}
                    <div className="absolute top-[20%] right-[20%] w-[350px] h-[350px] bg-teal-500/20 rounded-full blur-[80px] animate-float" />
                    <div className="absolute bottom-[20%] left-[20%] w-[400px] h-[400px] bg-sky-500/15 rounded-full blur-[100px] animate-float delay-500" />

                    <div className="relative z-10 w-full max-w-md text-white animate-fade-up">
                        <Link href="/" className="inline-flex items-center gap-3 mb-12 hover:-translate-y-1 transition-transform group">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
                                <img src="/logo.svg" alt="KIIT Wellness" className="w-8 h-8 object-contain brightness-0 invert" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">KIIT Wellness Space</span>
                        </Link>
                        <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-[1.1] tracking-tight">
                            Guide the next generation.
                        </h2>
                        <p className="text-lg text-teal-50/80 font-medium leading-relaxed mb-12">
                            Access the mentor portal to review check-ins, provide essential human support, and securely connect with students who need you.
                        </p>

                        {/* Interactive Feature List */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">Secure Portal</h4>
                                    <p className="text-sm text-teal-100/70">Encrypted student communications</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-sky-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">Insight Analytics</h4>
                                    <p className="text-sm text-sky-100/70">Overview of campus wellbeing</p>
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
                            <h1 className="text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">Mentor Portal</h1>
                            <p className="text-lg text-slate-500 font-medium">Secure access for authorized mentors</p>
                        </div>

                        {error && (
                            <div className="mb-8">
                                <Alert variant="danger">{error}</Alert>
                            </div>
                        )}

                        {devOtp && step === 'OTP' && (
                            <div className="mb-8">
                                <Alert variant="warning" title="Development Mode">
                                    Your secure code: <span className="font-mono font-bold text-lg select-all">{devOtp}</span>
                                </Alert>
                            </div>
                        )}

                        <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 shadow-sm mb-8 transition-all duration-300">
                            {step === 'EMAIL' ? (
                                <form onSubmit={handleRequestOtp} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Mentor Email
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-5 py-3.5 rounded-2xl bg-white border border-slate-200/80 text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-400 transition-all disabled:opacity-50 disabled:bg-slate-50 font-medium shadow-sm"
                                            placeholder="mentor@kiit.ac.in"
                                            disabled
                                        />
                                        <p className="text-sm text-slate-500 mt-3 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            Restricted to authorized staff
                                        </p>
                                    </div>

                                    <Button
                                        type="submit"
                                        loading={loading}
                                        className="w-full text-base py-3.5 hover-scale"
                                        size="lg"
                                    >
                                        Verify Email
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-6 animate-pop">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Verification Code
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full px-4 py-5 rounded-2xl bg-white border border-slate-200/80 text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-400 transition-all text-center text-3xl tracking-[0.5em] font-mono shadow-sm"
                                            placeholder="000000"
                                            maxLength={6}
                                            autoFocus
                                        />
                                        <p className="text-sm text-slate-500 mt-3 text-center">
                                            Sent to {email}
                                        </p>
                                    </div>

                                    <Button
                                        type="submit"
                                        loading={loading}
                                        disabled={otp.length !== 6}
                                        className="w-full text-base py-3.5 hover-scale"
                                        size="lg"
                                    >
                                        Sign In securely
                                    </Button>

                                    <div className="text-center pt-2">
                                        <button
                                            type="button"
                                            onClick={() => { setStep('EMAIL'); setOtp(''); setDevOtp(''); }}
                                            className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                            Use different email
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        <div className="flex flex-col items-center justify-center space-y-6">
                            <Link
                                href="/login"
                                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-semibold hover:bg-white hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm transition-all"
                            >
                                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Student Sign In
                            </Link>

                            <p className="text-sm font-medium text-slate-400">
                                Need technical support? Access help documentation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}
