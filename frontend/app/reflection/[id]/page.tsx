'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ReflectionData {
    id: string;
    completedAt: string;
    responseCount: number;
    reflection: string;
    wellbeingAreas: Array<{ area: string; status: string }>;
    nextSteps: {
        message: string;
        canReachOut: boolean;
        supportEmail: string;
    };
}

export default function ReflectionPage() {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ReflectionData | null>(null);

    useEffect(() => {
        fetchReflection();
    }, [sessionId]);

    const fetchReflection = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return router.push('/login');

            const res = await fetch(`${API_URL}/student/reflection/${sessionId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) return router.push('/login');
            if (res.status === 404) return router.push('/dashboard');

            const payload = await res.json();
            setData(payload);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="text-stone-400 text-sm">Loading your reflection...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="text-stone-500">Check-in not found.</div>
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
                        <h1 className="text-lg font-medium text-stone-800">Your Reflection</h1>
                        <p className="text-xs text-stone-400">
                            {new Date(data.completedAt).toLocaleDateString('en-IN', {
                                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-10 space-y-10">

                {/* Reflection Summary */}
                <section className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm text-center">
                    <div className="w-14 h-14 bg-amber-100 rounded-full mx-auto flex items-center justify-center mb-6">
                        <span className="text-2xl">🌿</span>
                    </div>
                    <p className="text-stone-700 text-lg leading-relaxed">
                        {data.reflection}
                    </p>
                    <p className="text-stone-400 text-sm mt-4">
                        Based on {data.responseCount} responses
                    </p>
                </section>

                {/* Wellbeing Areas */}
                {data.wellbeingAreas && data.wellbeingAreas.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wider">Areas of Wellbeing</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {data.wellbeingAreas.map((area, i) => (
                                <div
                                    key={i}
                                    className={`p-4 rounded-xl border ${area.status === 'Doing well'
                                            ? 'bg-emerald-50 border-emerald-100'
                                            : area.status === 'Worth some attention'
                                                ? 'bg-amber-50 border-amber-100'
                                                : 'bg-stone-50 border-stone-100'
                                        }`}
                                >
                                    <p className="text-stone-800 font-medium text-sm">{area.area}</p>
                                    <p className={`text-xs mt-1 ${area.status === 'Doing well'
                                            ? 'text-emerald-600'
                                            : area.status === 'Worth some attention'
                                                ? 'text-amber-600'
                                                : 'text-stone-500'
                                        }`}>
                                        {area.status}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* What Happens Next - Clarity Layer */}
                <section className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50 space-y-4">
                    <h2 className="text-sm font-medium text-blue-800">What happens now?</h2>
                    <p className="text-stone-600 text-sm leading-relaxed">
                        {data.nextSteps.message}
                    </p>
                    <div className="pt-4 border-t border-blue-100/50">
                        <p className="text-xs text-stone-500">
                            If you'd like to talk to someone, you can always email <span className="font-medium text-blue-600">{data.nextSteps.supportEmail}</span>
                        </p>
                    </div>
                </section>

                {/* Safety Footer */}
                <footer className="text-center pt-6 border-t border-stone-100 space-y-4">
                    <p className="text-xs text-stone-400">
                        Remember: this is a reflection, not an assessment or diagnosis.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                    >
                        Return to Your Space →
                    </button>
                </footer>
            </main>
        </div>
    );
}
