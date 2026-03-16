"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper, Card, Button, Alert, ProgressBar } from '@/components/ui';

// Used for recording audio
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

export default function SurveyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [question, setQuestion] = useState<any>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Audio State
    const [isRecording, setIsRecording] = useState(false);
    const [isUploadingAudio, setIsUploadingAudio] = useState(false);
    const [audioAnalysis, setAudioAnalysis] = useState<{ transcript: string, mood: string } | null>(null);

    // Timers for Voice Questions
    const [prepTimer, setPrepTimer] = useState(5); // 5s reading time
    const [recordingTimer, setRecordingTimer] = useState(30); // 30s max recording
    const [hasPrepped, setHasPrepped] = useState(false);

    // Signals
    const [startTime, setStartTime] = useState<number>(Date.now());

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const ESTIMATED_TOTAL = 32;

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const startSurvey = async () => {
            try {
                const res = await fetch(`${API_URL}/survey/start`, {
                    method: 'POST',
                    headers: getAuthHeaders()
                });

                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem('token');
                    router.push('/login');
                    return;
                }

                if (!res.ok) throw new Error('Failed to start survey');

                const data = await res.json();
                setSessionId(data.sessionId);
                setQuestion(data.question);
                setStartTime(Date.now()); // Start timer
                setLoading(false);
            } catch (err: any) {
                setError(err.message || 'Failed to start survey');
                setLoading(false);
            }
        };
        startSurvey();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAnswer = async (answerValue: number) => {
        if (isTransitioning) return;
        setIsTransitioning(true);

        const timeTaken = Date.now() - startTime;

        try {
            const newHistory = [...history, { questionId: question.id, answer: answerValue }];
            await new Promise(r => setTimeout(r, 300));

            const res = await fetch(`${API_URL}/survey/respond`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    sessionId,
                    questionId: question.id,
                    answer: answerValue,
                    history: newHistory,
                    timeTaken, // Phase A Signal
                    changeCount: 0 // Auto-submit UI implies 0 changes
                })
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('token');
                router.push('/login');
                return;
            }

            if (!res.ok) throw new Error("Failed to save response");

            const data = await res.json();
            setHistory(newHistory);

            if (data.shouldStop) {
                await finalizeSurvey();
            } else {
                setQuestion(data.nextQuestion);
                setAudioAnalysis(null); // Reset audio analysis for next question

                // Reset Voice Timers
                if (data.nextQuestion?.type === 'voice_recording') {
                    setPrepTimer(5);
                    setRecordingTimer(30);
                    setHasPrepped(false);
                    setIsRecording(false);
                }

                setStartTime(Date.now()); // Reset timer/start for next
                setIsTransitioning(false);
            }
        } catch (err) {
            setIsTransitioning(false);
            setError("Something went wrong. Please try again.");
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunks.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                // Automatically upload and then answer the question
                await uploadAudio(audioBlob);

                // Stop all tracks to release mic
                stream.getTracks().forEach(track => track.stop());

                // Auto submit for voice_recording questions (since they don't have MCQs)
                if (question?.type === 'voice_recording') {
                    handleAnswer(0); // Send dummy score for voice questions
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setAudioAnalysis(null);
        } catch (err) {
            console.error("Error accessing mic:", err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        // Enforce 15s minimum recording duration (30 - 15 = 15s elapsed)
        if (recordingTimer > 15 && question?.type === 'voice_recording') {
            alert(`Please speak for at least ${15 - (30 - recordingTimer)} more seconds.`);
            return;
        }

        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const uploadAudio = async (blob: Blob) => {
        setIsUploadingAudio(true);
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');
        formData.append('sessionId', sessionId!);
        if (question) {
            formData.append('questionId', question.id);
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/survey/audio`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Do NOT set Content-Type here, let fetch handle multipart boundary
                },
                body: formData
            });

            if (!res.ok) throw new Error("Audio upload failed");

            const data = await res.json();
            if (data.analysis) {
                setAudioAnalysis(data.analysis);
            }
        } catch (err) {
            console.error("Audio processing failed", err);
        } finally {
            setIsUploadingAudio(false);
        }
    };

    const finalizeSurvey = async () => {
        try {
            const res = await fetch(`${API_URL}/survey/complete`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ sessionId })
            });

            if (!res.ok) throw new Error('Failed to complete survey');

            const result = await res.json();
            localStorage.setItem('surveyResult', JSON.stringify(result));
            router.push('/survey/results');
        } catch (err) {
            setError("Failed to submit. Please try again.");
            setIsTransitioning(false);
        }
    };

    // Effect for handling timers
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (question?.type === 'voice_recording') {
            if (!hasPrepped && prepTimer > 0) {
                // Countdown for reading
                interval = setInterval(() => {
                    setPrepTimer(prev => prev - 1);
                }, 1000);
            } else if (!hasPrepped && prepTimer === 0) {
                setHasPrepped(true);
                // AUTO START: Start recording automatically after reading time
                startRecording();
            } else if (hasPrepped && isRecording) {
                interval = setInterval(() => {
                    setRecordingTimer(prev => {
                        if (prev <= 1) {
                            // Auto stop at max 30s
                            stopRecording();
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        }

        return () => clearInterval(interval);
    }, [question, prepTimer, hasPrepped, isRecording]);

    if (loading) {
        return (
            <PageWrapper showNav={false}>
                <div className="min-h-screen flex items-center justify-center">
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-slate-600 font-medium"
                    >
                        Preparing your space...
                    </motion.div>
                </div>
            </PageWrapper>
        );
    }

    if (error) {
        return (
            <PageWrapper showNav={false}>
                <div className="min-h-screen flex items-center justify-center p-6">
                    <Card className="max-w-md w-full text-center p-8">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-rose-50 flex items-center justify-center">
                            <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-slate-600 mb-6">{error}</p>
                        <Button onClick={() => window.location.reload()}>
                            Try Again
                        </Button>
                    </Card>
                </div>
            </PageWrapper>
        );
    }

    if (!question) {
        return (
            <PageWrapper showNav={false}>
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-slate-500">Loading question...</p>
                </div>
            </PageWrapper>
        );
    }


    const progressPercent = Math.min(90, (history.length / ESTIMATED_TOTAL) * 100);

    return (
        <PageWrapper showNav={false}>
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100 z-50">
                <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            <main className="min-h-screen flex items-center justify-center p-6 pb-32">
                <div className="max-w-2xl w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={question.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            <span className="text-xs font-medium tracking-wider text-slate-400 uppercase mb-4 block">
                                Reflection {history.length + 1}
                            </span>

                            <h2 className="text-2xl md:text-3xl font-medium text-slate-800 mb-6 leading-relaxed">
                                {question.text}
                            </h2>

                            {/* Voice Recording Interaction */}
                            <div className="mb-10 bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-700">
                                                {question.type === 'voice_recording' ? 'Required Voice Note' : 'Optional Voice Note'}
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                {question.type === 'voice_recording' ? 'Please speak for up to 30 seconds.' : 'Add context to your answer with your voice'}
                                            </p>
                                        </div>

                                        {/* Timers and Controls */}
                                        <div className="flex items-center gap-3 ml-auto md:ml-0">
                                            {question.type === 'voice_recording' && !hasPrepped ? (
                                                <span className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 shrink-0">
                                                    Reading Time: {prepTimer}s
                                                </span>
                                            ) : question.type === 'voice_recording' && isRecording ? (
                                                <span className="text-sm font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 shrink-0">
                                                    {recordingTimer}s left
                                                </span>
                                            ) : null}

                                            {isUploadingAudio ? (
                                                <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium shrink-0">
                                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                    </motion.div>
                                                    Processing...
                                                </div>
                                            ) : isRecording ? (
                                                <button onClick={stopRecording} className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors font-medium text-sm shrink-0">
                                                    <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                                    Stop
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={startRecording}
                                                    disabled={question.type === 'voice_recording' && !hasPrepped}
                                                    className="px-4 py-2 bg-white text-indigo-600 border border-indigo-200 shadow-sm rounded-lg hover:bg-indigo-50 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                                >
                                                    Record
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Display AI Analysis of Voice */}
                                <AnimatePresence>
                                    {audioAnalysis && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="bg-white rounded-xl p-4 border border-indigo-100 space-y-3 shadow-sm mt-4"
                                        >
                                            <div>
                                                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">Transcript</span>
                                                <p className="text-slate-600 text-sm italic">"{audioAnalysis.transcript}"</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Detected Mood:</span>
                                                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md border border-indigo-100">
                                                    {audioAnalysis.mood}
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {question.type !== 'voice_recording' && (
                                <div className="space-y-3">
                                    {question.options.map((opt: any, idx: number) => (
                                        <QuestionOption
                                            key={opt.letter}
                                            option={opt}
                                            index={idx}
                                            onSelect={() => handleAnswer(opt.score)}
                                            disabled={isTransitioning}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Footer Hint */}
            <div className="fixed bottom-8 left-0 right-0 text-center text-slate-400 text-sm pointer-events-none">
                Take your time. There are no right or wrong answers.
            </div>
        </PageWrapper>
    );
}

function QuestionOption({ option, index, onSelect, disabled }: any) {
    return (
        <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={onSelect}
            disabled={disabled}
            className={`
                group w-full text-left p-5 md:p-6 rounded-2xl 
                glass-panel border border-slate-200/70
                hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-lg hover:shadow-indigo-500/10
                active:scale-[0.99] transition-all duration-200
                flex items-center gap-4
                disabled:opacity-50 disabled:cursor-not-allowed
            `}
        >
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-bold group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-violet-500 group-hover:text-white transition-all">
                {option.letter}
            </div>
            <span className="text-lg text-slate-700 font-medium group-hover:text-slate-800">
                {option.text}
            </span>
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </div>
        </motion.button>
    );
}
