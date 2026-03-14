'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageWrapper, Card, Button, EmptyState } from '@/components/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface CheckInSummary {
    id: string;
    completedAt: string;
    reflection: string;
}

interface StudentHomeData {
    totalCheckIns: number;
    lastCheckIn: string | null;
    recentCheckIns: CheckInSummary[];
}

export default function StudentDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<StudentHomeData | null>(null);
    const [showPrivacy, setShowPrivacy] = useState(false);

    useEffect(() => {
        fetchStudentHome();
    }, []);

    const fetchStudentHome = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return router.push('/login');

            const res = await fetch(`${API_URL}/student/home`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) return router.push('/login');

            const payload = await res.json();
            setData(payload);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading) {
        return (
            <PageWrapper>
                <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse-soft" />
                    <div className="relative z-10 text-center animate-fade-in">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
                            <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                            <img src="/logo.svg" alt="Loading" className="absolute inset-0 w-12 h-12 m-auto rounded-xl object-contain animate-pulse" />
                        </div>
                        <p className="text-slate-600 font-medium tracking-wide">Preparing your space...</p>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="min-h-screen bg-slate-50 relative overflow-hidden">
                {/* Ambient Background Elements */}
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

                {/* Header */}
                <header className="sticky top-0 z-50 glass-panel border-b border-white/40 shadow-sm transition-all duration-300">
                    <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:shadow transition-shadow">
                                <img src="/logo.svg" alt="KIIT Wellness Space" className="w-6 h-6 object-contain" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-800 tracking-tight">Your Space</h1>
                                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Student Portal</p>
                            </div>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-sm font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-full transition-all"
                        >
                            Sign out
                        </button>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-6 py-12 space-y-16 relative z-10">
                    {/* Welcome Section / Hero */}
                    <section className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-3xl blur-[40px] opacity-20 animate-pulse-soft" />
                        <div className="relative bg-white/60 backdrop-blur-xl border border-white/80 shadow-lg rounded-3xl p-8 md:p-12 text-center flex flex-col items-center">
                            <div className="w-24 h-24 mb-8 relative group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-sky-50 rounded-full scale-110 blur-xl group-hover:scale-125 transition-transform duration-500" />
                                <div className="w-full h-full relative rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-4xl animate-float">
                                    🌱
                                </div>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
                                Welcome back
                            </h2>
                            <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed mb-8">
                                This is your personal space to reflect on how you're feeling.
                                Everything here is <span className="font-semibold text-indigo-600">private</span>, <span className="font-semibold text-indigo-600">supportive</span>, and <span className="font-semibold text-indigo-600">judgment-free</span>.
                            </p>

                            <Button
                                size="lg"
                                onClick={() => router.push('/survey')}
                                className="text-lg px-10 py-4 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover-scale group"
                            >
                                <span>Start a Check-In</span>
                                <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Button>
                            <p className="text-sm font-medium text-slate-400 mt-4">
                                Takes about 3-5 minutes. You can stop anytime.
                            </p>

                            {/* Privacy Toggle */}
                            <div className="mt-12 w-full max-w-2xl mx-auto pt-8 border-t border-slate-200/50">
                                <button
                                    onClick={() => setShowPrivacy(!showPrivacy)}
                                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors inline-flex items-center gap-2 px-4 py-2 rounded-full hover:bg-indigo-50"
                                >
                                    {showPrivacy ? 'Hide privacy details' : 'How is my data protected?'}
                                    <svg className={`w-4 h-4 transition-transform duration-300 ${showPrivacy ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showPrivacy ? 'max-h-[500px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
                                    <div className="bg-slate-50/50 rounded-2xl p-6 text-left border border-slate-100">
                                        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                            Your Privacy Matters
                                        </h3>
                                        <ul className="space-y-4 text-sm text-slate-600">
                                            {[
                                                "You're in control. Your responses help us understand how to support you better.",
                                                "No AI diagnosis. We don't label, diagnose, or make automated decisions about you.",
                                                "Human support. If needed, a trained mentor may reach out gently.",
                                                "Your data stays safe. Only designated support staff can access your responses."
                                            ].map((text, i) => (
                                                <li key={i} className="flex gap-3 items-start">
                                                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                    <span className="leading-relaxed">{text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Past Check-Ins */}
                    {data && data.totalCheckIns > 0 && (
                        <section className="space-y-6">
                            <div className="flex items-end justify-between px-2">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Your Journey</h3>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Review past reflections and monitor your growth</p>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                    <span className="text-xs font-bold text-indigo-700 tracking-wide uppercase">
                                        {data.totalCheckIns} Entry{data.totalCheckIns > 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {data.recentCheckIns?.slice(0, 3).map((checkIn, index) => (
                                    <Card
                                        key={checkIn.id}
                                        hover
                                        onClick={() => router.push(`/reflection/${checkIn.id}`)}
                                        className="animate-fade-up group cursor-pointer border border-transparent hover:border-indigo-100 transition-all shadow-sm"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="flex items-center justify-between p-2">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex flex-col items-center justify-center border border-indigo-100/50 group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-colors">
                                                    <span className="text-xs font-bold text-indigo-400 group-hover:text-indigo-100">{new Date(checkIn.completedAt).toLocaleDateString('en-IN', { month: 'short' })}</span>
                                                    <span className="text-base font-extrabold text-indigo-600 group-hover:text-white leading-none mt-0.5">{new Date(checkIn.completedAt).toLocaleDateString('en-IN', { day: '2-digit' })}</span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">
                                                        {new Date(checkIn.completedAt).toLocaleDateString('en-IN', { weekday: 'long' })}
                                                    </p>
                                                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                                                        {checkIn.reflection || 'View your detailed reflection and AI insights'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:-translate-x-1 transition-all">
                                                <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            {data.totalCheckIns > 3 && (
                                <div className="pt-4 flex justify-center">
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push('/history')}
                                        className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 rounded-full px-8"
                                    >
                                        View full history ({data.totalCheckIns} entries)
                                    </Button>
                                </div>
                            )}
                        </section>
                    )}

                    {/* First Timer Empty State */}
                    {(!data || data.totalCheckIns === 0) && (
                        <div className="text-center py-12 px-6 bg-white/50 backdrop-blur-md rounded-3xl border border-slate-200/50 border-dashed">
                            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl animate-float">
                                📝
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No check-ins yet</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">
                                This is the beginning of your wellbeing journey. Start your first check-in when you're ready.
                            </p>
                        </div>
                    )}

                    {/* Footer */}
                    <footer className="text-center pt-12 pb-8 border-t border-slate-200/50 space-y-3">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <img src="/logo.svg" alt="KIIT Wellness" className="w-6 h-6 grayscale opacity-50" />
                            <span className="text-sm font-bold text-slate-400 tracking-wide uppercase">KIIT Wellness Space</span>
                        </div>
                        <p className="text-xs font-medium text-slate-400">
                            A secure, supportive space constructed for student wellbeing.
                        </p>
                    </footer>
                </main>
            </div>
        </PageWrapper>
    );
}
