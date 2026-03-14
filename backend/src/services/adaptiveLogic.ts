import { UserResponse } from '../models/types';
import { questions } from '../models/questions';
import { Question } from '../models/types';

export interface AdaptiveResult {
    nextQuestion: Question | null;
    shouldStop: boolean;
    reason?: string;
}

const ANCHOR_QUESTIONS = ['Q1', 'Q8', 'Q10', 'Q25', 'Q30', 'Q32'];
const VOICE_QUESTIONS = ['V1', 'V2', 'V3', 'V4'];
const DOMAINS = [
    'Sleep', 'Avoidance', 'Rumination', 'Perfectionism', 'Isolation', 'Anhedonia', 'Control'
];

const DOMAIN_ACTIVATORS: Record<string, { question: string; answer: string; trigger: string }[]> = {
    Sleep: [
        { question: 'Q1', answer: 'C', trigger: 'Q23' },
        { question: 'Q2', answer: 'D', trigger: 'Q24' },
    ],
    Rumination: [
        { question: 'Q8', answer: 'D', trigger: 'Q9' },
        { question: 'Q10', answer: 'D', trigger: 'Q16' },
    ],
    Isolation: [
        { question: 'Q11', answer: 'D', trigger: 'Q12' },
    ],
    Avoidance: [
        { question: 'Q6', answer: 'D', trigger: 'Q7a' },
    ],
};

function shouldStopEarly(responses: UserResponse[], askedQuestions: string[]): boolean {
    if (askedQuestions.length < 15) return false; // Need minimum questions

    // Low-risk pattern: A/B answers on key depression markers
    const q30 = responses.find(r => r.questionId === 'Q30');
    const q25 = responses.find(r => r.questionId === 'Q25');
    const q10 = responses.find(r => r.questionId === 'Q10');

    // If questions are answered and are 'A' (low risk)
    if (q30?.answer === 'A' && q25?.answer === 'A' && q10?.answer === 'A') {
        return true; // Very low risk
    }

    // Also check if no high risk answers so far
    const highRiskCount = responses.filter(r => r.answer === 'D').length;
    if (highRiskCount === 0 && askedQuestions.length >= 15) {
        return true;
    }

    return false;
}

function shouldEscalate(responses: UserResponse[]): boolean {
    const q10 = responses.find(r => r.questionId === 'Q10');
    const q32 = responses.find(r => r.questionId === 'Q32');
    const q31 = responses.find(r => r.questionId === 'Q31');

    // Suicide risk pattern
    if (q10?.answer === 'D' && q32?.answer === 'D') {
        return true;
    }

    // Severe depression pattern
    if (q10?.answer === 'D' && q32?.answer === 'D' && q31?.answer === 'D') {
        return true;
    }

    // Isolation + hopelessness
    const q11 = responses.find(r => r.questionId === 'Q11');
    const q12 = responses.find(r => r.questionId === 'Q12');
    const q13 = responses.find(r => r.questionId === 'Q13');

    if (q11?.answer === 'D' && q12?.answer === 'D' && q13?.answer === 'D' && q10?.answer === 'D') {
        return true;
    }

    return false;
}

function getNextVoiceQuestion(responses: UserResponse[]): string | null {
    const answeredVoiceQuestions = responses
        .map(r => r.questionId)
        .filter(id => VOICE_QUESTIONS.includes(id));

    for (const vq of VOICE_QUESTIONS) {
        if (!answeredVoiceQuestions.includes(vq)) {
            return vq;
        }
    }
    return null; // All voice questions answered
}

function getNextQuestionId(responses: UserResponse[], askedQuestions: string[]): string | null {
    // Always ask anchor questions first
    const unaskedAnchors = ANCHOR_QUESTIONS.filter(q => !askedQuestions.includes(q));
    if (unaskedAnchors.length > 0) {
        return unaskedAnchors[0];
    }

    // Check which domains should be activated
    const activatedDomains = new Set<string>();

    for (const [domain, activators] of Object.entries(DOMAIN_ACTIVATORS)) {
        for (const activator of activators) {
            const response = responses.find(r => r.questionId === activator.question);
            if (response?.answer === activator.answer) {
                activatedDomains.add(domain);
            }
        }
    }

    // Find next question from activated domains
    for (const domain of activatedDomains) {
        const domainQuestions = questions.filter(q =>
            q.domain?.includes(domain) && !askedQuestions.includes(q.id)
        );

        if (domainQuestions.length > 0) {
            return domainQuestions[0].id;
        }
    }

    // If no activated domains, ask remaining general questions
    // Sort remaining questions by weight (highest first) to maximize information gain
    const unasked = questions
        .filter(q => !askedQuestions.includes(q.id) && !VOICE_QUESTIONS.includes(q.id))
        .sort((a, b) => b.weight - a.weight);

    return unasked.length > 0 ? unasked[0].id : null;
}

export function selectNextQuestion(
    responses: UserResponse[],
    askedQuestions: string[]
): AdaptiveResult {
    // console.log("Selecting next question, asked:", askedQuestions.length);

    // Check critical escalation first
    if (shouldEscalate(responses)) {
        // Even if escalating, they must finish voice, so let's bypass early stops for voice
        const nextVoice = getNextVoiceQuestion(responses);
        if (nextVoice) {
            const nextQuestion = questions.find(q => q.id === nextVoice);
            return { nextQuestion: nextQuestion || null, shouldStop: false, reason: 'Escalating to Voice Phase' };
        }
        return { nextQuestion: null, shouldStop: true, reason: 'Critical risk detected and voice finished' };
    }

    // Check if should stop early
    if (shouldStopEarly(responses, askedQuestions)) {
        const nextVoice = getNextVoiceQuestion(responses);
        if (nextVoice) {
            const nextQuestion = questions.find(q => q.id === nextVoice);
            return { nextQuestion: nextQuestion || null, shouldStop: false, reason: 'Transitioning to Voice Phase' };
        }
        return { nextQuestion: null, shouldStop: true, reason: 'Low-risk pattern detected and voice finished' };
    }

    try {
        // Find next question based on adaptive rules
        let nextId = getNextQuestionId(responses, askedQuestions);

        // If MCQ phase is over, start Voice phase
        if (!nextId) {
            nextId = getNextVoiceQuestion(responses);
        }

        if (!nextId) {
            return { nextQuestion: null, shouldStop: true, reason: 'All relevant and voice questions answered' };
        }

        const nextQuestion = questions.find(q => q.id === nextId);
        if (!nextQuestion) {
            console.error("CRITICAL: Found nextId but no question object", nextId);
        }
        return { nextQuestion: nextQuestion || null, shouldStop: false };
    } catch (err) {
        console.error("Error in getNextQuestionId or lookup", err);
        throw err;
    }
}
