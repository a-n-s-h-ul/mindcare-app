'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '../lib/types';

interface AdaptiveQuestionProps {
    question: Question;
    onAnswer: (questionId: string, answer: string) => void;
    isSubmitting: boolean;
}

export default function AdaptiveQuestion({ question, onAnswer, isSubmitting }: AdaptiveQuestionProps) {
    const [selected, setSelected] = useState<string | null>(null);

    const handleSelect = (letter: string) => {
        setSelected(letter);
        // Add small delay for visual feedback before submitting
        setTimeout(() => {
            onAnswer(question.id, letter);
            setSelected(null);
        }, 400);
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                >
                    <h2 className="text-2xl md:text-3xl font-medium text-slate-800 mb-8 leading-relaxed">
                        {question.text}
                    </h2>

                    <div className="space-y-4">
                        {question.options.map((option) => (
                            <motion.button
                                key={option.letter}
                                onClick={() => !isSubmitting && handleSelect(option.letter)}
                                className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 
                  ${selected === option.letter
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-md'
                                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700'
                                    }`}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <div className="flex items-center">
                                    <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border mr-4 font-semibold
                    ${selected === option.letter ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 text-slate-500'}
                  `}>
                                        {option.letter}
                                    </span>
                                    <span className="text-lg">{option.text}</span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
