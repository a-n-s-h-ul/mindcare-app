'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface CheckIn {
    id: string;
    completedAt: string;
    responseCount: number;
    label: string;
}

export default function HistoryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return router.push('/login');

            const res = await fetch(`${API_URL}/student/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) return router.push('/login');

            const payload = await res.json();
            setCheckIns(payload.checkIns || []);
            setTotal(payload.total || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="text-stone-400 text-sm">Loading your journey...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50/30 font-sans">
            {/* Header */}
            <header className="bg-white/70 backdrop-blur-sm border-b border-stone-100">
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard')} className="text-stone-400 hover:text-stone-600">
                        ← Back
                    </button>
                    <div>
                        <h1 className="text-lg font-medium text-stone-800">Your Journey</h1>
                        <p className="text-xs text-stone-400">All your past check-ins</p>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">

                {/* Journey Stats */}
                <section className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm text-center">
                    <div className="flex items-center justify-center gap-8">
                        <div>
                            <p className="text-3xl font-light text-amber-600">{total}</p>
                            <p className="text-xs text-stone-400 mt-1">Check-ins</p>
                        </div>
                        <div className="h-10 w-px bg-stone-200"></div>
                        <div>
                            <p className="text-sm text-stone-600">
                                Every step matters.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Timeline */}
                {checkIns.length === 0 ? (
                    <section className="text-center py-16">
                        <p className="text-stone-400">No check-ins yet. Start your first one!</p>
                        <button
                            onClick={() => router.push('/survey')}
                            className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                        >
                            Start Check-In
                        </button>
                    </section>
                ) : (
                    <section className="space-y-3">
                        {checkIns.map((checkIn, index) => (
                            <button
                                key={checkIn.id}
                                onClick={() => router.push(`/reflection/${checkIn.id}`)}
                                className="w-full text-left bg-white rounded-xl p-5 border border-stone-100 hover:border-amber-200 hover:shadow-sm transition-all group flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Timeline Dot */}
                                    <div className="relative">
                                        <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                                        {index < checkIns.length - 1 && (
                                            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-stone-200"></div>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-stone-800 font-medium group-hover:text-amber-700">
                                            {checkIn.label}
                                        </p>
                                        <p className="text-xs text-stone-400 mt-1">
                                            {new Date(checkIn.completedAt).toLocaleDateString('en-IN', {
                                                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                                            })}
                                            <span className="mx-2">•</span>
                                            {checkIn.responseCount} responses
                                        </p>
                                    </div>
                                </div>

                                <span className="text-stone-300 group-hover:text-amber-500 transition-colors">→</span>
                            </button>
                        ))}
                    </section>
                )}

                {/* Footer Message */}
                <footer className="text-center pt-8 border-t border-stone-100">
                    <p className="text-xs text-stone-400">
                        Your wellbeing journey is personal and private.
                    </p>
                </footer>
            </main>
        </div>
    );
}
