"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Lock, Activity, ArrowRight } from 'lucide-react';

export default function ConsentStep() {
    const router = useRouter();
    const [isExiting, setIsExiting] = useState(false);

    const handleAgree = () => {
        setIsExiting(true);
        setTimeout(() => {
            router.push('/login');
        }, 400); // Wait for exit animation
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isExiting ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
            >
                {/* Header Strip */}
                <div className="h-2 bg-gradient-to-r from-blue-400 to-indigo-500" />

                <div className="p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <Lock className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-primary uppercase tracking-wider">Confidential Space</span>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 mb-6">
                        Before we begin...
                    </h1>

                    <div className="space-y-6 text-lg text-slate-600 leading-relaxed mb-10">
                        <p>
                            This is a standard wellness check-in designed for KIIT students.
                            The goal is to understand your current stress levels and daily patterns.
                        </p>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-3">
                                <Shield className="w-5 h-5 text-wellness-green flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-slate-900 text-sm">100% Private</h4>
                                    <p className="text-sm text-slate-500 mt-1">We don't collect names or roll numbers. You are anonymous.</p>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-3">
                                <Activity className="w-5 h-5 text-wellness-yellow flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-slate-900 text-sm">Not a Diagnosis</h4>
                                    <p className="text-sm text-slate-500 mt-1">This tool identifies patterns, it does not diagnose medical conditions.</p>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-slate-400 italic">
                            *If you are in immediate danger, please exit and contact Campus Security or Aasra (9820466726).
                        </p>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="px-6 py-3 text-slate-500 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAgree}
                            className="px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-medium transition-all shadow-lg flex items-center gap-2 group"
                        >
                            I Understand & Agree
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
