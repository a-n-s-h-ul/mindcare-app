'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageWrapper, Card, Button, Badge } from '@/components/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// --- Types tailored for Progressive Disclosure ---

interface StudentProfile {
    student: {
        id: string;
        email: string;
        rollNo: string;
        joinedAt: string;
        lastLogin: string;
        totalSessions: number;
    };
    // Temporal Layer: History of risk changes
    sessions: Array<{
        id: string;
        completedAt: string;
        overallRisk: string;
        domainScores: Record<string, number>;
        answerCount: number;
        avgTimePerQuestion?: number;
        reliability?: {
            score: number;
            confidence: 'LOW' | 'MEDIUM' | 'HIGH';
        };
    }>;
    mentorNotes: Array<{ id: string; content: string; created_at: string; mentor_email: string }>;
}

export default function StudentDetailPage() {
    const router = useRouter();
    const params = useParams();
    const studentId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<StudentProfile | null>(null);
    const [activeTab, setActiveTab] = useState<'context' | 'notes'>('context');
    const [noteContent, setNoteContent] = useState('');

    useEffect(() => {
        fetchStudentData();
    }, [studentId]);

    const fetchStudentData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return router.push('/mentor/login');

            const res = await fetch(`${API_URL}/mentor/student/${studentId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) return router.push('/mentor/login');

            const payload = await res.json();
            setData(payload);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNote = async () => {
        if (!noteContent.trim()) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/mentor/notes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ studentId, content: noteContent })
            });
            setNoteContent('');
            fetchStudentData();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <PageWrapper showNav={false}>
            <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse-soft" />
                <div className="relative z-10 text-center animate-fade-in">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
                        <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                        <img src="/logo.svg" alt="Loading" className="absolute inset-0 w-12 h-12 m-auto rounded-xl object-contain animate-pulse" />
                    </div>
                    <p className="text-slate-600 font-medium tracking-wide">Loading student context...</p>
                </div>
            </div>
        </PageWrapper>
    );

    if (!data) return null;

    const latestSession = data.sessions[0] || null;
    const previousSession = data.sessions[1] || null;

    // Tier 1: Immediate Signals
    const riskTrend = latestSession && previousSession
        ? getRiskValue(latestSession.overallRisk) - getRiskValue(previousSession.overallRisk)
        : 0;

    return (
        <PageWrapper>
            <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900">
                {/* Ambient Base */}
                <div className="absolute top-[0%] left-[-10%] w-[600px] h-[600px] bg-slate-900/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Header: Identity & Navigation */}
                <header className="sticky top-0 z-40 glass-panel border-b border-slate-200/60 shadow-sm backdrop-blur-xl">
                    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-6">
                        <button
                            onClick={() => router.push('/mentor/dashboard')}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold text-slate-800 tracking-tight">{data.student.rollNo || data.student.email}</h1>
                                <Badge variant={latestSession?.overallRisk === 'critical' ? 'danger' : latestSession?.overallRisk === 'high' ? 'warning' : 'info'}>
                                    {latestSession?.overallRisk?.toUpperCase() || 'UNKNOWN'}
                                </Badge>
                            </div>
                            <p className="text-sm font-medium text-slate-500 mt-0.5">{data.student.email}</p>
                        </div>
                    </div>
                </header>

                <main className="max-w-6xl mx-auto px-6 py-8 space-y-8 relative z-10 animate-fade-up">

                    {/* 1. UNDERSTANDING LAYER (Tier 1: Instant Context) */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Primary Signal card */}
                        <Card className="col-span-1 md:col-span-2 p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-[60px] pointer-events-none opacity-50" />
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Current Status Indicator</p>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                                            {latestSession ? latestSession.overallRisk.replace('_', ' ').toUpperCase() : 'NO DATA'}
                                        </h2>
                                        {/* Trend Indicator */}
                                        {riskTrend > 0 ? (
                                            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 text-rose-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                                                <span>Deteriorating</span>
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                            </div>
                                        ) : riskTrend < 0 ? (
                                            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                                                <span>Improving</span>
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                            </div>
                                        ) : latestSession ? (
                                            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-500 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                                                <span>Stable</span>
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                            </div>
                                        ) : null}
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 mt-3 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Last assessed: {latestSession ? new Date(latestSession.completedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Never'}
                                    </p>
                                </div>

                                {/* Mini-sparkline concept for domains */}
                                {/* Mini-sparkline concept for domains */}
                                {latestSession && (
                                    <div className="flex flex-col gap-3 relative z-10 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                        {/* Reliability Indicator (Phase B) */}
                                        <div className="flex sm:justify-end items-center gap-2">
                                            <span className="text-[10px] uppercase font-bold text-slate-400">Confidence</span>
                                            {/* @ts-ignore */}
                                            {latestSession.reliability?.confidence === 'LOW' ? (
                                                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200 flex items-center gap-1 shadow-sm">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                    Mild ({Math.round((latestSession.reliability?.score || 0) * 100)}%)
                                                </span>
                                            ) : (
                                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-200 flex items-center gap-1 shadow-sm">
                                                    <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                    High
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-1.5 h-16 w-full sm:w-40 items-end mt-1">
                                            {Object.entries(latestSession.domainScores).slice(0, 5).map(([d, s]) => (
                                                <div key={d} className="flex-1 bg-slate-200 hover:bg-indigo-400 rounded-t-md transition-all duration-300 relative group cursor-pointer" style={{ height: `${Math.max(10, s)}%` }}>
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-indigo-900 text-white text-[11px] font-medium px-2 py-1 rounded-lg whitespace-nowrap z-20 shadow-lg after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-indigo-900 border border-indigo-800">
                                                        {d}: {s}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Action Card */}
                        <Card className="flex flex-col justify-center gap-4 bg-gradient-to-br from-slate-50 to-slate-100/50">
                            <Button
                                variant="primary"
                                onClick={() => setActiveTab('notes')}
                                className="w-full text-left justify-start shadow-sm"
                            >
                                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                Add Clinical Note
                            </Button>
                            <Button
                                variant="secondary"
                                className="w-full text-left justify-start border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300"
                            >
                                <svg className="w-5 h-5 mr-1 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                Flag for Review
                            </Button>
                        </Card>
                    </section>

                    {/* 2. CONTEXT LAYER (Tier 2: Timeline & Meaning) */}
                    <div className="flex gap-8 border-b border-slate-200/60 pb-1">
                        <button
                            onClick={() => setActiveTab('context')}
                            className={`pb-3 text-sm font-bold tracking-wide transition-all ${activeTab === 'context' ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-slate-400 hover:text-slate-600 border-b-2 border-transparent hover:border-slate-200'}`}
                        >
                            Timeline Context
                        </button>
                        <button
                            onClick={() => setActiveTab('notes')}
                            className={`pb-3 text-sm font-bold tracking-wide transition-all ${activeTab === 'notes' ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-slate-400 hover:text-slate-600 border-b-2 border-transparent hover:border-slate-200'}`}
                        >
                            Case Notes
                            {data.mentorNotes.length > 0 && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'notes' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {data.mentorNotes.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {activeTab === 'context' && (
                        <div className="space-y-6 animate-fade-up">
                            {data.sessions.length === 0 ? (
                                <Card className="text-center py-16 border-dashed">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⏳</div>
                                    <p className="text-slate-500 font-medium">No check-in history available yet.</p>
                                    <p className="text-sm text-slate-400 mt-2">Student has not completed any reflections.</p>
                                </Card>
                            ) : (
                                <div className="relative border-l-2 border-slate-200/70 ml-4 space-y-10 pb-12 mt-4">
                                    {data.sessions.map((session, i) => (
                                        <div key={session.id} className="relative pl-10 group/timeline">
                                            {/* Timeline Dot */}
                                            <div className={`absolute -left-[11px] top-6 w-5 h-5 rounded-full border-[3px] border-white shadow-sm transition-transform group-hover/timeline:scale-125 z-10 ${session.overallRisk === 'critical' ? 'bg-rose-500' :
                                                session.overallRisk === 'high' ? 'bg-amber-500' :
                                                    session.overallRisk === 'moderate' ? 'bg-teal-400' :
                                                        'bg-emerald-400'
                                                }`} />

                                            {/* Event Card */}
                                            <Card
                                                hover
                                                onClick={() => router.push(`/mentor/student/${studentId}/survey/${session.id}`)}
                                                className="p-6 cursor-pointer border border-transparent hover:border-slate-200 group/card bg-white/80 backdrop-blur-md"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate-100/80 pb-4">
                                                    <div>
                                                        <h3 className="font-bold text-slate-800 text-lg group-hover/card:text-indigo-600 transition-colors">Assessment #{data.sessions.length - i}</h3>
                                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                                                            {new Date(session.completedAt).toLocaleDateString('en-US', {
                                                                weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                    <Badge variant={session.overallRisk === 'critical' ? 'danger' : session.overallRisk === 'high' ? 'warning' : 'info'}>
                                                        {session.overallRisk.toUpperCase()} RISK
                                                    </Badge>
                                                </div>

                                                <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                                                    Analysis driven by <strong className="text-slate-700">{session.answerCount} responses</strong>
                                                    {session.avgTimePerQuestion ? (
                                                        <span className="ml-1 text-slate-400">
                                                            ({(session.avgTimePerQuestion / 1000).toFixed(1)}s avg response time)
                                                        </span>
                                                    ) : null}.
                                                </p>

                                                {/* Tier 2 Disclosure: Domain Snapshot */}
                                                <div className="flex gap-2 flex-wrap">
                                                    {Object.entries(session.domainScores)
                                                        .filter(([_, s]) => s > 50)
                                                        .map(([d, s]) => (
                                                            <span key={d} className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-md shadow-sm">
                                                                {d}: <strong className="text-slate-700">{s}</strong>
                                                            </span>
                                                        ))}
                                                </div>

                                                <div className="mt-6 flex items-center gap-2 text-sm font-bold text-indigo-600 opacity-0 transform translate-x-[-10px] group-hover/card:opacity-100 group-hover/card:translate-x-0 transition-all">
                                                    View Clinical Analysis
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                                </div>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3. CASE MANAGEMENT LAYER (Notes) */}
                    {activeTab === 'notes' && (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 animate-fade-up">
                            {/* Write Note */}
                            <div className="md:col-span-2 space-y-4">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">New Observation</h3>
                                <div className="glass-panel p-2">
                                    <textarea
                                        className="w-full p-4 bg-transparent border-none focus:ring-0 outline-none text-sm min-h-[200px] text-slate-700 placeholder:text-slate-400 resize-none"
                                        placeholder="Record private clinical observations, interventions, or follow-up plans..."
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                    />
                                </div>
                                <Button
                                    variant="primary"
                                    onClick={handleSaveNote}
                                    className="w-full"
                                    disabled={!noteContent.trim()}
                                >
                                    Save Record as Mentor
                                </Button>
                            </div>

                            {/* Note History */}
                            <div className="md:col-span-3 space-y-4">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    Clinical History
                                    <span className="bg-slate-200 text-slate-600 cursor-default px-2 py-0.5 rounded-full text-[10px] items-center flex">{data.mentorNotes.length}</span>
                                </h3>
                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                                    {data.mentorNotes.length === 0 ? (
                                        <Card className="text-center py-12 border-dashed">
                                            <p className="text-slate-500 font-medium">No clinical notes recorded yet.</p>
                                        </Card>
                                    ) : (
                                        data.mentorNotes.map(note => (
                                            <Card key={note.id} className="p-5 relative group border-slate-200/60 shadow-none">
                                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                                                </div>
                                                <p className="text-slate-700 whitespace-pre-wrap mb-4 text-sm leading-relaxed pr-6">{note.content}</p>
                                                <div className="flex justify-between items-center bg-slate-50 rounded-lg p-3 text-xs text-slate-500 border border-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                                                            {note.mentor_email.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-slate-700">{note.mentor_email}</span>
                                                    </div>
                                                    <span className="font-semibold tracking-wide">
                                                        {new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </PageWrapper>
    );
}

// Helper
function getRiskValue(risk: string): number {
    switch (risk) {
        case 'critical': return 4;
        case 'high': return 3;
        case 'moderate': return 2;
        default: return 1;
    }
}
