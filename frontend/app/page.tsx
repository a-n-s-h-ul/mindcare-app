'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LandingPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <main className="min-h-screen bg-mesh-light relative overflow-hidden selection:bg-indigo-500/20 selection:text-indigo-900">
            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
                <div className="mx-auto max-w-6xl px-6 mt-4">
                    <div className="glass-panel rounded-full px-6 py-3 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3 hover-scale cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100 p-1">
                                <img src="/logo.svg" alt="KIIT Wellness Space" className="w-8 h-8 rounded-lg object-contain" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-900 tracking-tight">KIIT Wellness Space</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">About</a>
                            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">How It Works</a>
                            <a href="#privacy" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Privacy</a>
                            <Link href="/login" className="text-sm font-semibold bg-indigo-50 text-indigo-700 px-5 py-2 rounded-full hover:bg-indigo-100 hover:text-indigo-800 transition-colors">Sign In</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 pt-24 pb-12">
                <div className="max-w-4xl mx-auto text-center z-10">
                    {/* Badge */}
                    <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-panel mb-8 hover-scale cursor-default transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <div className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </div>
                        <span className="text-sm font-medium text-slate-700 tracking-wide">A safe space for your wellbeing</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className={`text-6xl md:text-8xl font-black leading-[1.1] tracking-tighter mb-8 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <span className="text-slate-800">Your mental health</span>
                        <br />
                        <span className="text-gradient-primary">matters here.</span>
                    </h1>

                    {/* Subheadline */}
                    <p className={`text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto mb-12 leading-relaxed transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        A calm, supportive space where you can check in with yourself.
                        No judgments. No diagnoses. Just understanding.
                    </p>

                    {/* CTA Buttons */}
                    <div className={`flex flex-col sm:flex-row items-center justify-center gap-5 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <Link href="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-full bg-slate-900 text-white shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-1 transition-all group">
                            <span>Begin Your Journey</span>
                            <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                        <Link href="/mentor/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-full glass-panel text-slate-700 hover:bg-white transition-all group">
                            <span className="group-hover:text-indigo-600 transition-colors">Mentor Access</span>
                            <svg className="w-5 h-5 text-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div className={`mt-20 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-400 transition-all duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>Completely Private</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Takes 5 minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>Human-Supported</span>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 transition-all duration-700 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-6 h-10 rounded-full border-2 border-slate-300 flex justify-center pt-2">
                        <div className="w-1 h-2 bg-slate-400 rounded-full animate-bounce" />
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section id="about" className="relative py-24 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 px-4">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-6 mt-10">
                            Built on trust, not pressure
                        </h2>
                        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                            We believe mental wellness starts with feeling safe.
                            Every interaction is designed to feel calm, supportive, and judgment-free.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 px-4">
                        {/* Card 1 */}
                        <div className="glass-panel rounded-[2rem] p-10 hover-lift group border border-slate-200/60 bg-white/40">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight">No watching</h3>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                Your data is yours alone. We don't track, analyze, or monitor you beyond what's needed to support your wellbeing.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="glass-panel rounded-[2rem] p-10 hover-lift group border border-slate-200/60 bg-white/40">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight">No diagnoses</h3>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                We don't label or diagnose. This is a space for self-reflection, not clinical evaluation. You're not a case number.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="glass-panel rounded-[2rem] p-10 hover-lift group border border-slate-200/60 bg-white/40">
                            <div className="w-16 h-16 rounded-2xl bg-violet-50/80 border border-violet-100 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-8 h-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight">Human support</h3>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                Real mentors, not just algorithms. When you need a human connection, trained mentors are here to listen and guide.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="relative py-24 px-6 md:px-12 bg-white/30 backdrop-blur-xl border-y border-white/40">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-24 px-4">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-6">
                            A gentle journey of self-discovery
                        </h2>
                        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
                            Take a few minutes to check in with yourself.
                            No pressure, no rush — just honest self-reflection.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connection Line */}
                        <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-indigo-100 via-violet-200 to-indigo-100" />

                        <div className="grid md:grid-cols-3 gap-12 lg:gap-20">
                            {/* Step 1 */}
                            <div className="relative text-center group">
                                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-500/20 group-hover:-translate-y-2 transition-transform duration-500 rotate-3 group-hover:rotate-0">
                                    <span className="text-3xl font-black text-white">1</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-4">Reflect</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    Answer simple, thoughtful questions about how you're feeling. There are no right or wrong answers.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="relative text-center group">
                                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-violet-500/20 group-hover:-translate-y-2 transition-transform duration-500 -rotate-3 group-hover:rotate-0">
                                    <span className="text-3xl font-black text-white">2</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-4">Understand</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    See a gentle summary of your wellbeing areas — presented in a way that feels supportive, not clinical.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="relative text-center group">
                                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-sky-500/20 group-hover:-translate-y-2 transition-transform duration-500 rotate-6 group-hover:rotate-0">
                                    <span className="text-3xl font-black text-white">3</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-4">Grow</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    Connect with mentors if you wish, or simply track your journey over time. The choice is always yours.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Privacy Section */}
            <section id="privacy" className="relative py-24 px-6 md:px-12">
                <div className="max-w-5xl mx-auto">
                    <div className="glass-panel rounded-[3rem] p-12 md:p-20 text-center border-emerald-200/40 bg-gradient-to-br from-white/60 to-emerald-50/10">
                        <div className="w-24 h-24 rounded-[2rem] bg-emerald-100 border-2 border-white flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/10 -rotate-3 hover:rotate-0 transition-transform duration-500">
                            <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-8 tracking-tight">
                            Your privacy is sacred
                        </h2>
                        <p className="text-xl text-slate-500 font-medium max-w-3xl mx-auto mb-14 leading-relaxed">
                            We don't sell your data. We don't share it with third parties.
                            Your wellbeing check-ins are encrypted and stored securely.
                            Only you and your chosen mentor (if any) can access your reflections.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-8 text-base text-slate-600 font-semibold bg-white/50 w-fit mx-auto px-8 py-4 rounded-full shadow-sm border border-white/80">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span>End-to-end encryption</span>
                            </div>
                            <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span>No third-party sharing</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative py-24 px-6 md:px-12">
                <div className="max-w-4xl mx-auto text-center glass-panel rounded-[3rem] p-16 bg-gradient-to-b from-indigo-50/50 to-white/50 overflow-hidden">
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-gradient-to-bl from-indigo-400/20 to-transparent rounded-full blur-[40px] pointer-events-none" />

                    <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-800 mb-6">
                        Ready to check in <br className="hidden md:block" /> with yourself?
                    </h2>
                    <p className="text-xl text-slate-500 font-medium mb-10 max-w-xl mx-auto">
                        It only takes a few minutes. No commitments, no pressure.
                    </p>
                    <Link href="/login" className="inline-flex items-center justify-center gap-3 px-10 py-5 text-xl font-bold rounded-full bg-slate-900 text-white shadow-2xl shadow-slate-900/30 hover:-translate-y-1 transition-transform group">
                        <span>Start Your Check-In</span>
                        <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative py-12 px-6 border-t border-slate-200/50">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <img src="/logo.svg" alt="KIIT Wellness Space" className="w-8 h-8 rounded-lg object-contain" />
                        <span className="font-medium text-slate-700">KIIT Wellness Space</span>
                    </div>
                    <div className="text-sm text-slate-400 text-center">
                        A safe space by KIIT University • 24/7 Crisis Support Available
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                        <Link href="#privacy" className="hover:text-indigo-600 transition-colors">Privacy</Link>
                        <Link href="#about" className="hover:text-indigo-600 transition-colors">About</Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}
