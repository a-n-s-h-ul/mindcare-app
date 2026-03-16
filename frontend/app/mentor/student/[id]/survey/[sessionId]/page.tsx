'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageWrapper, Card, Button, Badge } from '@/components/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface SessionDetail {
    session: {
        id: string;
        status: string;
        startedAt: string;
        completedAt: string;
        domainScores: Record<string, number>;
        patternClusters: Array<{ name: string; confidence: number; description?: string }>;
        riskFlags: Record<string, string>;
        overallRisk: string;
    };
    responses: Array<{ question_id: string; answer: number; created_at: string }>;
    audioAnalysis?: Array<{
        question_id?: string;
        transcript: string;
        predicted_mood: string;
        confidence_score: string;
        observations?: string[];
    }>;
    ragAnalysis: {
        reasoning: any;
        report: any;
        createdAt: string;
    } | null;
}

export default function SurveyDetailPage() {
    const router = useRouter();
    const params = useParams();
    const studentId = params.id as string;
    const sessionId = params.sessionId as string;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<SessionDetail | null>(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'responses' | 'analysis' | 'chat'>('overview');
    const [isRegenerating, setIsRegenerating] = useState(false);

    // Chat state
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'model'; message: string }>>([]);
    const [isChatting, setIsChatting] = useState(false);

    useEffect(() => {
        fetchSessionDetail();
    }, [studentId, sessionId]);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const fetchSessionDetail = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/mentor/login');
                return;
            }

            const res = await fetch(`${API_URL}/mentor/student/${studentId}/session/${sessionId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401 || res.status === 403) {
                router.push('/mentor/login');
                return;
            }

            if (!res.ok) throw new Error('Failed to load session data');
            const data = await res.json();
            setData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        const userMsg = chatMessage;
        setChatMessage('');
        setChatHistory(prev => [...prev, { role: 'user', message: userMsg }]);
        setIsChatting(true);

        try {
            const res = await fetch(`${API_URL}/mentor/student/${studentId}/chat`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ message: userMsg, history: chatHistory })
            });
            if (!res.ok) throw new Error('Failed to get response');
            const data = await res.json();
            setChatHistory(prev => [...prev, { role: 'model', message: data.answer }]);
        } catch (err: any) {
            setChatHistory(prev => [...prev, { role: 'model', message: 'Error: Failed to connect to AI assistant.' }]);
        } finally {
            setIsChatting(false);
        }
    };

    const handleRegenerate = async () => {
        setIsRegenerating(true);
        try {
            const res = await fetch(`${API_URL}/mentor/student/${studentId}/regenerate-rag`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ sessionId })
            });
            if (!res.ok) throw new Error('Failed to regenerate analysis');
            await fetchSessionDetail();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsRegenerating(false);
        }
    };

    const getRiskStyle = (risk: string) => {
        const styles: Record<string, string> = {
            critical: 'bg-red-600 text-white',
            high: 'bg-orange-500 text-white',
            moderate: 'bg-yellow-500 text-white',
            low: 'bg-green-500 text-white',
        };
        return styles[risk?.toLowerCase()] || 'bg-gray-400 text-white';
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <PageWrapper showNav={false}>
                <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse-soft" />
                    <div className="relative z-10 text-center animate-fade-in">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
                            <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                            <img src="/logo.svg" alt="Loading" className="absolute inset-0 w-12 h-12 m-auto rounded-xl object-contain animate-pulse" />
                        </div>
                        <p className="text-slate-600 font-medium tracking-wide">Loading detailed insight report...</p>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    if (error || !data) {
        return (
            <PageWrapper showNav={false}>
                <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
                    <Card className="text-center p-12 max-w-lg border-rose-100 shadow-xl bg-white/80 backdrop-blur-md">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Analysis Unavailable</h2>
                        <p className="text-slate-500 mb-8">{error || 'This survey could not be found or lacks sufficient data.'}</p>
                        <Button variant="outline" onClick={() => router.back()} className="w-full">
                            ← Return to Student Profile
                        </Button>
                    </Card>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900">
                {/* Ambient Base */}
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-slate-900/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Header */}
                <header className="sticky top-0 z-40 glass-panel border-b border-slate-200/60 shadow-sm backdrop-blur-xl">
                    <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => router.push(`/mentor/student/${studentId}`)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors shrink-0"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Clinical Insight Report</h1>
                                <p className="text-sm font-medium text-slate-500 mt-0.5">{formatDate(data.session.completedAt)}</p>
                            </div>
                        </div>
                        <Badge variant={data.session.overallRisk === 'critical' ? 'danger' : data.session.overallRisk === 'high' ? 'warning' : 'info'} className="w-fit">
                            {data.session.overallRisk?.toUpperCase()} RISK DETECTED
                        </Badge>
                    </div>
                </header>

                <main className="max-w-6xl mx-auto px-6 py-8 relative z-10">
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2 mb-8 glass-panel rounded-xl p-1.5 border border-slate-200/60 w-fit shadow-sm">
                        {(['overview', 'responses', 'analysis', 'chat'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                                    }`}
                            >
                                {tab === 'overview' ? 'Domain Breakdown' :
                                    tab === 'analysis' ? 'Deep AI Analysis' :
                                        tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Overview/Domain Scores Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-fade-up">
                            {/* Domain Scores Grid */}
                            <Card className="p-8">
                                <h2 className="text-lg font-bold text-slate-800 mb-6 uppercase tracking-wider">Domain Quantifications</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {Object.entries(data.session.domainScores).map(([domain, score]) => (
                                        <div key={domain} className="bg-slate-50/80 rounded-2xl p-5 text-center border border-slate-100 relative group overflow-hidden transition-all hover:shadow-md hover:border-slate-200">
                                            <p className="text-sm font-semibold text-slate-500 capitalize mb-3 tracking-wide">{domain}</p>
                                            <div className="relative z-10">
                                                <div className="flex items-end justify-center gap-1 mb-3">
                                                    <span className={`text-5xl font-extrabold tracking-tight ${score > 70 ? 'text-rose-600' :
                                                        score > 50 ? 'text-amber-500' :
                                                            score > 30 ? 'text-teal-500' : 'text-emerald-500'
                                                        }`}>
                                                        {score}
                                                    </span>
                                                    <span className="text-slate-400 font-medium mb-1">/100</span>
                                                </div>
                                                <div className="h-2.5 bg-slate-200/60 rounded-full overflow-hidden shadow-inner">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${score > 70 ? 'bg-gradient-to-r from-rose-400 to-rose-500' :
                                                            score > 50 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                                                score > 30 ? 'bg-gradient-to-r from-teal-400 to-teal-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                                            }`}
                                                        style={{ width: `${score}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Voice Analysis Signal Group (Phase C Enhancement) */}
                            {data.audioAnalysis && data.audioAnalysis.length > 0 && (
                                <Card className="p-8 border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
                                    <h2 className="text-lg font-bold text-slate-800 mb-6 uppercase tracking-wider flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                            </svg>
                                        </div>
                                        Clinical Voice Artifacts
                                    </h2>
                                    <div className="space-y-4">
                                        {data.audioAnalysis.map((audio, i) => (
                                            <div key={i} className="flex flex-col gap-3 p-5 bg-white rounded-2xl border border-indigo-50 shadow-sm relative group transition-all hover:border-indigo-200">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recording #{i+1}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Predicted Mood:</span>
                                                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                                                            {audio.predicted_mood.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-[15px] italic text-slate-700 leading-relaxed font-medium">"{audio.transcript}"</p>
                                                {audio.observations && audio.observations.length > 0 && (
                                                    <div className="mt-2 pt-3 border-t border-slate-50">
                                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2 block">AI Observables</span>
                                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {audio.observations.map((obs, idx) => (
                                                                <li key={idx} className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                                    <div className="w-1 h-1 rounded-full bg-indigo-300" />
                                                                    {obs}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 p-4 bg-amber-50/50 rounded-xl border border-amber-100/50 flex items-start gap-4">
                                        <span className="text-xl">💡</span>
                                        <p className="text-xs text-amber-900 font-medium leading-relaxed">
                                            <strong>Cross-Modal Tip:</strong> Compare these spoken notes with the MCQ scores above. Significant discrepancies between a "Calm" tone and "Elevated" scores (or vice-versa) can provide critical context for follow-up.
                                        </p>
                                    </div>
                                </Card>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Risk Flags */}
                                <Card className="p-8">
                                    <h2 className="text-lg font-bold text-slate-800 mb-6 uppercase tracking-wider flex items-center gap-2">
                                        <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                                        Primary Risk Flags
                                    </h2>
                                    {Object.keys(data.session.riskFlags || {}).length === 0 ? (
                                        <p className="text-slate-500 italic">No significant risk flags detected in this session.</p>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            {Object.entries(data.session.riskFlags || {}).map(([flag, level]) => (
                                                <div key={flag} className={`flex items-center justify-between p-4 rounded-xl border ${level === 'HIGH' || level === 'YES' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                                                    level === 'MODERATE' || level === 'POSSIBLE' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                                                        'bg-emerald-50 border-emerald-100 text-emerald-800'
                                                    }`}>
                                                    <span className="font-semibold capitalize">{flag.replace(/_/g, ' ').toLowerCase()}</span>
                                                    <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-extrabold tracking-wider ${level === 'HIGH' || level === 'YES' ? 'bg-rose-100 text-rose-700' :
                                                        level === 'MODERATE' || level === 'POSSIBLE' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-emerald-100 text-emerald-700'
                                                        }`}>
                                                        {level}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card>

                                {/* Pattern Clusters */}
                                {data.session.patternClusters && data.session.patternClusters.length > 0 && (
                                    <Card className="p-8">
                                        <h2 className="text-lg font-bold text-slate-800 mb-6 uppercase tracking-wider flex items-center gap-2">
                                            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                            Detected Themes
                                        </h2>
                                        <div className="space-y-4">
                                            {data.session.patternClusters.map((pattern, i) => (
                                                <div key={i} className="bg-gradient-to-br from-indigo-50 to-slate-50 rounded-xl p-5 border border-indigo-100/50 relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-colors" />
                                                    <div className="flex items-start justify-between mb-3 relative z-10">
                                                        <span className="font-bold text-indigo-900 text-base">{pattern.name}</span>
                                                        <span className="text-[10px] font-extrabold uppercase bg-white text-indigo-600 px-2 py-1.5 rounded-md shadow-sm border border-indigo-50">
                                                            {Math.round(pattern.confidence * 100)}% Match
                                                        </span>
                                                    </div>
                                                    {pattern.description && (
                                                        <p className="text-sm text-slate-600 leading-relaxed relative z-10">{pattern.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Responses Tab */}
                    {activeTab === 'responses' && (
                        <Card className="p-8 animate-fade-up">
                            <h2 className="text-lg font-bold text-slate-800 mb-6 uppercase tracking-wider flex items-center gap-2">
                                Raw Data Points
                                <span className="bg-slate-100 text-slate-500 font-semibold px-2 py-1 rounded-md text-xs">{data.responses.length}</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.responses.map((r, i) => (
                                     <div key={i} className={`flex flex-col p-5 border rounded-xl hover:shadow-md transition-all group ${r.question_id.startsWith('V') ? 'bg-indigo-50/30 border-indigo-100' : 'bg-slate-50 border-slate-100/60 hover:border-indigo-100'}`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <span className="font-bold text-slate-700 text-sm group-hover:text-indigo-700 transition-colors uppercase tracking-wide truncate pr-2">
                                                {r.question_id.replace(/_/g, ' ')}
                                                {r.question_id.startsWith('V') && <Badge className="ml-2 text-[8px] bg-indigo-100 text-indigo-700 border-indigo-200">VOICE</Badge>}
                                            </span>
                                        </div>

                                        {r.question_id.startsWith('V') ? (
                                            <div className="mt-auto">
                                                {(() => {
                                                    const analysis = data.audioAnalysis?.find(a => a.question_id === r.question_id);
                                                    return analysis ? (
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Mood:</span>
                                                                <span className="text-[10px] font-bold text-indigo-600 uppercase">{analysis.predicted_mood}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 italic line-clamp-2 leading-relaxed">"{analysis.transcript.substring(0, 60)}..."</p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-slate-400">
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                                            <span className="text-[10px] font-medium italic">Processing Voice...</span>
                                                        </div>
                                                    );
                                                })()}
                                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-indigo-100/50">
                                                    <span className="text-[10px] font-semibold text-slate-400">
                                                        {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-end justify-between mt-auto pt-2 border-t border-slate-200/50">
                                                <span className="text-xs font-semibold text-slate-400">
                                                    {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex gap-1">
                                                        {[0, 1, 2, 3].map(val => (
                                                            <div
                                                                key={val}
                                                                className={`w-2.5 h-2.5 rounded-full transition-colors ${val <= r.answer
                                                                    ? r.answer >= 2 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                                                                    : 'bg-slate-200'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className={`font-extrabold text-lg leading-none ${r.answer >= 2 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                        {r.answer}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* AI Analysis Tab */}
                    {activeTab === 'analysis' && (
                        <div className="space-y-6 animate-fade-up">
                            <Card className="p-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                    <div>
                                        <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                                            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                                                <svg className="w-5 h-5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            </div>
                                            Intelligence Engine
                                        </h2>
                                        <p className="text-sm font-medium text-slate-500 mt-1">Deep clinical synthesis powered by Gemini 2.0 Flash</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={handleRegenerate}
                                        disabled={isRegenerating}
                                        className="bg-white/50 backdrop-blur-sm shadow-sm hover:border-indigo-300 hover:text-indigo-700 w-full sm:w-auto"
                                    >
                                        {isRegenerating ? (
                                            <><svg className="w-4 h-4 mr-2 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating...</>
                                        ) : data.ragAnalysis ? (
                                            <><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Regenerate Report</>
                                        ) : (
                                            <><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg> Request Generation</>
                                        )}
                                    </Button>
                                </div>

                                {data.ragAnalysis ? (() => {
                                    const ragOutput = data.ragAnalysis.report || data.ragAnalysis;
                                    let llmReport = ragOutput?.report || {};
                                    if (Array.isArray(llmReport)) {
                                        llmReport = llmReport[0] || {};
                                    }

                                    const narrativeSummary = llmReport.narrative_summary || ragOutput.narrative_summary;
                                    const keyInsights = llmReport.key_insights || ragOutput.probable_contributors || [];
                                    const supportFocus = llmReport.support_focus || ragOutput.intervention_suggestions || [];
                                    const conversationGuidance = llmReport.conversation_guidance || ragOutput.conversation_guidance || [];
                                    const protectiveFactors = llmReport.protective_factors || ragOutput.protective_factors || [];
                                    const dominantDomains = ragOutput.dominant_domains || [];
                                    const reasoningSummary = ragOutput.reasoning_summary || [];

                                    const hasData = narrativeSummary || keyInsights.length > 0 || dominantDomains.length > 0 || reasoningSummary.length > 0 || supportFocus.length > 0;

                                    if (!hasData) {
                                        return (
                                            <div className="py-12 text-center border-t border-slate-100">
                                                <p className="text-slate-500 font-medium">No valid insights could be parsed from the model response.</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="space-y-6">
                                            {/* Narrative Summary */}
                                            {narrativeSummary && (
                                                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
                                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                                        <svg className="w-24 h-24 text-indigo-900" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                                                    </div>
                                                    <h3 className="font-bold text-indigo-900 text-lg mb-4 uppercase tracking-wider flex items-center gap-2">
                                                        Clinical Summary
                                                    </h3>
                                                    <p className="text-indigo-900/80 leading-relaxed font-medium relative z-10 text-[15px]">{narrativeSummary}</p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {/* Key Insights & Details */}
                                                <div className="space-y-6">
                                                    {/* Dominant Domains */}
                                                    {dominantDomains.length > 0 && (
                                                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                                            <h3 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">Core Focus Areas</h3>
                                                            <div className="flex flex-wrap gap-2">
                                                                {dominantDomains.map((d: string) => (
                                                                    <span key={d} className="px-3 py-1.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg text-sm font-bold shadow-sm">{d}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Key Insights */}
                                                    {keyInsights.length > 0 && (
                                                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                                            <h3 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">Pathological Insights</h3>
                                                            <ul className="space-y-3">
                                                                {keyInsights.map((c: string, i: number) => (
                                                                    <li key={i} className="flex items-start gap-3">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0 shadow-[0_0_5px_rgba(99,102,241,0.5)]" />
                                                                        <span className="text-slate-600 leading-relaxed text-sm font-medium">{c}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-6">
                                                    {/* Support Focus / Actionable Items */}
                                                    {supportFocus.length > 0 && (
                                                        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-inner">
                                                            <h3 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                                                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                                Prescriptive Guidance
                                                            </h3>
                                                            <div className="space-y-3">
                                                                {supportFocus.map((s: string, i: number) => (
                                                                    <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm transition-transform hover:-translate-y-0.5 pointer-events-none">
                                                                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0 text-xs">
                                                                            {i + 1}
                                                                        </div>
                                                                        <span className="text-slate-700 font-medium text-sm leading-relaxed">{s}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Conversation Guidance */}
                                                    {conversationGuidance.length > 0 && (
                                                        <div className="bg-amber-50/50 rounded-2xl border border-amber-100 p-6 shadow-sm">
                                                            <h3 className="font-bold text-amber-900 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                                                                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                                Dialogue Framing
                                                            </h3>
                                                            <div className="space-y-3">
                                                                {conversationGuidance.map((g: string, i: number) => (
                                                                    <div key={i} className="p-4 bg-white rounded-xl border border-amber-200/60 shadow-sm relative italic text-amber-900/90 text-sm font-medium leading-relaxed">
                                                                        <span className="absolute -left-2 -top-2 text-2xl text-amber-300 pointer-events-none">"</span>
                                                                        {g}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Escalation Warning */}
                                            {ragOutput.escalation_required && (
                                                <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-6 flex items-center gap-6 animate-pulse-soft">
                                                    <div className="w-14 h-14 rounded-full bg-rose-200 flex items-center justify-center shrink-0">
                                                        <span className="text-3xl text-rose-600">⚠️</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-extrabold text-rose-800 text-lg uppercase tracking-wide">Critical Escalation Suggested</h3>
                                                        <p className="text-rose-700 font-medium mt-1">Data patterns strongly indicate the need for immediate professional intervention or external referral.</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Meta Footer */}
                                            {data.ragAnalysis.createdAt && (
                                                <div className="pt-4 border-t border-slate-100 text-right">
                                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        Generated: {formatDate(data.ragAnalysis.createdAt)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })() : null}
                            </Card>
                        </div>
                    )}

                    {/* Chat Tab */}
                    {activeTab === 'chat' && (
                        <Card className="overflow-hidden flex flex-col h-[700px] p-0 animate-fade-up border-indigo-100/60 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.15)]">
                            <div className="p-5 border-b border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 flex items-center justify-between backdrop-blur-md">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center border border-indigo-100">
                                        <span className="text-2xl">🤖</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 tracking-tight">AI Clinical Assistant</h3>
                                        <p className="text-xs font-semibold text-indigo-600/80 uppercase tracking-widest mt-0.5">Interactive Survey Context</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-extrabold uppercase px-3 py-1.5 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-full shadow-sm">
                                    Powered by Gemini
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                                {chatHistory.length === 0 ? (
                                    <div className="text-center text-slate-400 mt-24">
                                        <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                        </div>
                                        <p className="text-lg font-bold text-slate-600 mb-2">How can I help you understand this case?</p>
                                        <div className="space-y-3 mt-8">
                                            <button onClick={() => setChatMessage("What are the primary clinical concerns presented in this specific survey?")} className="block w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 py-2 rounded-lg transition-colors border border-transparent hover:border-indigo-100">"What are the primary clinical concerns?"</button>
                                            <button onClick={() => setChatMessage("Are there any immediate interventions you recommend based on these answers?")} className="block w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 py-2 rounded-lg transition-colors border border-transparent hover:border-indigo-100">"Are there any immediate interventions you recommend?"</button>
                                        </div>
                                    </div>
                                ) : (
                                    chatHistory.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-2xl p-5 shadow-sm transform transition-all animate-pop ${msg.role === 'user'
                                                ? 'bg-indigo-600 text-white rounded-br-sm'
                                                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
                                                }`}>
                                                <p className={`text-[15px] leading-relaxed font-medium ${msg.role === 'model' ? 'opacity-90 leading-loose' : ''}`}>{msg.message}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {isChatting && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-slate-200 rounded-2xl p-5 rounded-bl-sm shadow-sm flex items-center h-14">
                                            <div className="flex gap-1.5">
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce shadow-sm" />
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.15s' }} />
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.3s' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-5 border-t border-slate-200 bg-white shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)] z-10 relative">
                                <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
                                    <input
                                        type="text"
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                        placeholder="Type your clinical inquiry here..."
                                        className="flex-1 px-5 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-[15px] bg-slate-50 focus:bg-white transition-all font-medium placeholder:text-slate-400 shadow-inner"
                                        disabled={isChatting}
                                    />
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={!chatMessage.trim() || isChatting}
                                        className="px-8 !rounded-xl shadow-md hover:shadow-lg disabled:shadow-none min-w-[120px]"
                                    >
                                        {isChatting ? (
                                            <svg className="w-5 h-5 mx-auto animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        ) : (
                                            <span className="flex items-center gap-2">Send <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></span>
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </Card>
                    )}
                </main>
            </div>
        </PageWrapper>
    );
}
