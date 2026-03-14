"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PageWrapper, Card, Button } from '@/components/ui';

interface SurveyResult {
    success: boolean;
    message: string;
    sessionId: string;
    completedAt: string;
    summary: {
        questionsAnswered: number;
        wellnessAreas: string[];
    };
}

export default function ResultsPage() {
    const [result, setResult] = useState<SurveyResult | null>(null);
    const router = useRouter();

    useEffect(() => {
        const stored = localStorage.getItem('surveyResult');
        if (stored) {
            try {
                setResult(JSON.parse(stored));
            } catch (e) {
                router.push('/');
            }
        } else {
            router.push('/');
        }
    }, [router]);

    if (!result) {
        return (
            <PageWrapper showNav={false}>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-slate-500">Loading...</div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper showNav={false}>
            <div className="min-h-screen flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl w-full"
                >
                    {/* Success Card */}
                    <Card className="overflow-hidden p-0">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-500 to-violet-500 p-10 md:p-12 text-center text-white">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
                            >
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </motion.div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-3">Thank You!</h1>
                            <p className="text-lg opacity-90">
                                Your responses have been recorded securely.
                            </p>
                        </div>

                        {/* Content */}
                        <div className="p-8 md:p-10 space-y-8">
                            {/* Summary */}
                            <div className="text-center">
                                <p className="text-slate-600 leading-relaxed">
                                    You answered <span className="font-semibold text-indigo-600">{result.summary.questionsAnswered}</span> questions.
                                    Our wellness team will review your responses to better understand
                                    how we can support you.
                                </p>
                            </div>

                            {/* What's Next */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="glass-panel rounded-3xl p-6 md:p-8"
                            >
                                <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-3 text-lg">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </div>
                                    What happens next?
                                </h3>
                                <ul className="space-y-4 text-slate-600">
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                        </div>
                                        <span>Your responses are completely <strong className="text-slate-700">confidential</strong> and securely stored.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                        </div>
                                        <span>A wellness mentor may reach out to offer personalized support and resources.</span>
                                    </li>
                                </ul>
                            </motion.div>

                            {/* Resources */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="glass-panel border-emerald-100/50 bg-gradient-to-br from-emerald-50/50 to-teal-50/20 rounded-3xl p-6 md:p-8"
                            >
                                <h3 className="font-bold text-emerald-900 mb-5 flex items-center gap-3 text-lg">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    Need someone to talk to now?
                                </h3>
                                <div className="grid gap-3">
                                    {[
                                        { name: 'KIIT Counseling Center', phone: '1800-XXX-XXXX' },
                                        { name: 'iCall (National Helpline)', phone: '9152987821' },
                                        { name: 'Vandrevala Foundation', phone: '1860-2662-345' },
                                    ].map(resource => (
                                        <div key={resource.name} className="flex justify-between items-center p-4 bg-white/60 hover:bg-white rounded-2xl transition-colors border border-emerald-100/30 shadow-sm">
                                            <span className="font-medium text-slate-700">{resource.name}</span>
                                            <a href={`tel:${resource.phone}`} className="font-mono font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 px-3 py-1 rounded-lg">
                                                {resource.phone}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Disclaimer */}
                            <p className="text-xs text-slate-400 text-center">
                                This screening is not a diagnosis. It's a starting point for understanding
                                your wellness. If you're in crisis, please reach out to the helplines above.
                            </p>
                        </div>
                    </Card>

                    {/* Return Link */}
                    <div className="text-center mt-8">
                        <Link
                            href="/dashboard"
                            onClick={() => localStorage.removeItem('surveyResult')}
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
                        >
                            Return to your space
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </PageWrapper>
    );
}
