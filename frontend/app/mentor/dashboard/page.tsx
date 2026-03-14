'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageWrapper, Card, Button, Badge, Tabs, EmptyState } from '@/components/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface DailyMetric {
    urgentCount: number;
    newRisks24h: number;
    pendingReviews: number;
}

interface StudentSummary {
    id: string;
    email: string;
    rollNo: string;
    lastActivity: string | null;
    riskLevel: string;
    urgencyScore?: number;
    topConcerns: string[];
    daysSinceCheck: number | null;
}

interface OrientationData {
    meta: { generatedAt: string; type: string };
    metrics: DailyMetric;
    priorityQueue: StudentSummary[];
    directory: StudentSummary[];
}

export default function MentorDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<OrientationData | null>(null);
    const [viewMode, setViewMode] = useState<'focus' | 'directory'>('focus');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrientationData();
    }, []);

    const fetchOrientationData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return router.push('/mentor/login');

            const res = await fetch(`${API_URL}/mentor/dashboard`, {
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/mentor/login');
    };

    const getRiskVariant = (risk: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
        if (risk === 'critical') return 'danger';
        if (risk === 'high') return 'warning';
        if (risk === 'moderate') return 'info';
        if (risk === 'low') return 'success';
        return 'default';
    };

    if (loading) {
        return (
            <PageWrapper>
                <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] animate-pulse-soft" />
                    <div className="relative z-10 text-center animate-fade-in">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 border-4 border-teal-100 rounded-full" />
                            <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin" />
                            <img src="/logo.svg" alt="Loading" className="absolute inset-0 w-12 h-12 m-auto rounded-xl object-contain animate-pulse" />
                        </div>
                        <p className="text-slate-600 font-medium tracking-wide">Loading workspace...</p>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    if (!data) return null;

    const directoryList = data.directory.filter(s =>
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.rollNo && s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <PageWrapper>
            <div className="min-h-screen bg-slate-50 relative overflow-hidden">
                {/* Ambient Background Elements */}
                <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

                {/* Header */}
                <header className="sticky top-0 z-50 glass-panel border-b border-white/40 shadow-sm transition-all duration-300">
                    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => router.push('/')}>
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:shadow transition-shadow">
                                <img src="/logo.svg" alt="KIIT Wellness Space" className="w-6 h-6 object-contain" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-800 tracking-tight">Mentor Workspace</h1>
                                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            {/* Key Metrics */}
                            <div className="hidden sm:flex items-center gap-5">
                                <div className="text-right">
                                    <p className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none">{data.metrics.newRisks24h}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">New (24h)</p>
                                </div>
                                <div className="w-px h-8 bg-slate-200/60" />
                                <div className="text-right">
                                    <p className="text-2xl font-extrabold text-rose-500 tracking-tight leading-none flex items-center justify-end gap-1">
                                        {data.metrics.urgentCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                                        {data.metrics.urgentCount}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Urgent</p>
                                </div>
                                <div className="w-px h-8 bg-slate-200/60 mr-2" />
                            </div>

                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-full transition-all"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </header>

                <main className="max-w-6xl mx-auto px-6 py-8 space-y-8 relative z-10">
                    {/* Mode Switcher */}
                    <Tabs
                        tabs={[
                            { id: 'focus', label: `Focus Queue (${data.priorityQueue.length})` },
                            { id: 'directory', label: 'Student Directory' }
                        ]}
                        activeTab={viewMode}
                        onChange={(id) => setViewMode(id as 'focus' | 'directory')}
                    />

                    {/* Focus Queue */}
                    {viewMode === 'focus' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                                    Priority Attention Needed
                                </h2>
                                <span className="text-xs text-slate-400">
                                    Sorted by urgency score
                                </span>
                            </div>

                            {data.priorityQueue.length === 0 ? (
                                <Card className="text-center py-12">
                                    <EmptyState
                                        icon={
                                            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        }
                                        title="Queue Clear"
                                        description="No urgent cases requiring immediate attention."
                                    />
                                </Card>
                            ) : (
                                <div className="grid gap-4 mt-4">
                                    {data.priorityQueue.map((student, index) => (
                                        <div
                                            key={student.id}
                                            onClick={() => router.push(`/mentor/student/${student.id}`)}
                                            className="animate-fade-up"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <Card
                                                hover
                                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 group border border-transparent hover:border-slate-200 transition-all shadow-sm bg-white/80 backdrop-blur-md cursor-pointer"
                                            >
                                                <div className="flex items-start sm:items-center gap-4">
                                                    {/* Risk Indicator Blob */}
                                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 relative">
                                                        <div className={`absolute inset-0 rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity ${student.riskLevel === 'critical' ? 'bg-rose-500' :
                                                                student.riskLevel === 'high' ? 'bg-amber-500' :
                                                                    'bg-teal-500'
                                                            }`} />
                                                        <svg className={`w-6 h-6 z-10 ${student.riskLevel === 'critical' ? 'text-rose-600' :
                                                                student.riskLevel === 'high' ? 'text-amber-600' :
                                                                    'text-teal-600'
                                                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            {student.riskLevel === 'critical' ? (
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                            ) : (
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            )}
                                                        </svg>
                                                    </div>

                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                                            <h3 className="text-lg font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                                                                {student.rollNo || student.email}
                                                            </h3>
                                                            {student.daysSinceCheck !== null && student.daysSinceCheck < 3 && (
                                                                <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                                                                    New Update
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                                            <span className="font-medium bg-slate-100 px-2 py-0.5 rounded-md text-xs">
                                                                Last active: {student.daysSinceCheck !== null ? `${student.daysSinceCheck}d ago` : 'Never'}
                                                            </span>
                                                            <span className="flex flex-wrap gap-1.5 mt-1 sm:mt-0">
                                                                {student.topConcerns.slice(0, 3).map(c => (
                                                                    <span key={c} className="bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full text-xs font-medium text-slate-600 shadow-sm">{c}</span>
                                                                ))}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6 justify-between sm:justify-end ml-16 sm:ml-0 mt-2 sm:mt-0 border-t border-slate-100 sm:border-0 pt-3 sm:pt-0">
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">Urgency Score</p>
                                                        <p className={`text-2xl font-extrabold tracking-tight ${(student.urgencyScore || 0) >= 80 ? 'text-rose-600' : 'text-slate-700'}`}>
                                                            {student.urgencyScore}
                                                        </p>
                                                    </div>
                                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors border border-slate-100">
                                                        <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Directory */}
                    {viewMode === 'directory' && (
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Search by email or roll no..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                            />

                            <Card className="p-0 overflow-hidden shadow-sm border border-slate-200/60 bg-white/80 backdrop-blur-md">
                                <div className="divide-y divide-slate-100/80">
                                    {directoryList.map((student) => (
                                        <div
                                            key={student.id}
                                            onClick={() => router.push(`/mentor/student/${student.id}`)}
                                            className="p-5 hover:bg-slate-50/80 cursor-pointer flex items-center justify-between transition-colors group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                    {(student.rollNo || student.email).charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                                                        {student.rollNo || 'No ID'}
                                                    </p>
                                                    <p className="text-xs font-medium text-slate-500">{student.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <Badge variant={getRiskVariant(student.riskLevel)}>
                                                    {student.riskLevel.toUpperCase()}
                                                </Badge>
                                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                                    <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {directoryList.length === 0 && (
                                        <div className="p-16 text-center text-slate-400">
                                            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center text-2xl">
                                                🔍
                                            </div>
                                            <p className="font-medium text-slate-600">No students found</p>
                                            <p className="text-sm mt-1">Try adjusting your search criteria</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}
                </main>
            </div>
        </PageWrapper>
    );
}
