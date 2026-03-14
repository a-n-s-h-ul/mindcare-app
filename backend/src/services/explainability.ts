import { UserResponse } from '../models/types';
import { RiskResult } from './riskScoring';
import { questions } from '../models/questions';

export interface ExplanationFactor {
    domain: string;
    contribution: number;
    indicator: string;
    description: string;
}

export interface CrisisResource {
    name: string;
    type: 'hotline' | 'counseling' | 'web';
    contact: string;
    availability: string;
}

export interface SafeExplanation {
    riskLevel: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
    score: number;
    title: string;
    summary: string;
    factors: ExplanationFactor[];
    nextSteps: string[];
    resources: CrisisResource[];
    confidenceStatement: string;
    disclaimer: string;
}

const CRISIS_RESOURCES: CrisisResource[] = [
    {
        name: 'KIIT Campus Counseling Center',
        type: 'counseling',
        contact: 'Extension: 8394804804',
        availability: 'Mon-Fri: 10 AM - 6 PM',
    },
    {
        name: 'Aasra Crisis Support',
        type: 'hotline',
        contact: '9820466726 (24/7, Call/WhatsApp)',
        availability: '24/7 Emergency Support',
    },
    {
        name: 'iCall Emotional Support',
        type: 'hotline',
        contact: '9152987821 (24/7)',
        availability: '24/7 Trained Counselors',
    },
    {
        name: 'Vandrevala Foundation Crisis Line',
        type: 'hotline',
        contact: '1860 2662 345',
        availability: '24/7 Phone Support',
    },
];

const RISK_DESCRIPTIONS = {
    GREEN: 'You appear to be managing stress well. Keep maintaining healthy habits.',
    YELLOW: 'You\'re experiencing some stress or mood changes. Support is available to help.',
    ORANGE: 'Significant patterns detected. Speaking with a counselor would be helpful.',
    RED: 'You may be struggling significantly. Professional support is important. Please reach out today.',
};

const NEXT_STEPS = {
    GREEN: [
        'Continue your current healthy habits',
        'Maintain consistent sleep and exercise routines',
        'Stay connected with friends and activities you enjoy',
        'Annual wellness check-in recommended',
    ],
    YELLOW: [
        'Schedule a free counseling consultation',
        'Try a consistent sleep schedule (bedtime within 1 hour each night)',
        'Reach out to a friend or family member',
        'Consider a stress-management or wellness workshop',
    ],
    ORANGE: [
        'Schedule a counseling appointment this week',
        'Speak with an academic advisor about course load if applicable',
        'Try one stress-reduction practice (exercise, meditation, journaling)',
        'Attend campus wellness activities',
    ],
    RED: [
        'Contact campus counseling center TODAY',
        'Call a crisis support line if in distress',
        'Tell a trusted friend or family member how you\'re feeling',
        'Consider speaking with an academic advisor about support options',
    ],
};

export function extractMeaningfulFactors(
    responses: UserResponse[],
    domainScores: Record<string, number>
): ExplanationFactor[] {
    const factors: ExplanationFactor[] = [];

    // Sleep issues
    const sleepScore = domainScores['Sleep'] || 0;
    if (sleepScore > 50) {
        const q25 = responses.find(r => r.questionId === 'Q25');
        const q24 = responses.find(r => r.questionId === 'Q24');

        if (q25?.answer === 'D') {
            factors.push({
                domain: 'Sleep',
                contribution: 0.18,
                indicator: 'Early morning waking',
                description: 'Waking consistently at 4-5 AM and unable to fall back asleep (a strong biological marker of mood concerns)',
            });
        }

        if (q24?.answer === 'D') {
            factors.push({
                domain: 'Sleep',
                contribution: 0.16,
                indicator: 'Fragmented sleep',
                description: 'Waking multiple times throughout the night, making sleep feel restless',
            });
        }

        const q23 = responses.find(r => r.questionId === 'Q23');
        if (q23?.answer === 'D') {
            factors.push({
                domain: 'Sleep',
                contribution: 0.15,
                indicator: 'Poor sleep quality',
                description: 'Struggling to fall or stay asleep, despite time in bed',
            });
        }
    }

    // Rumination/worry
    const ruminationScore = domainScores['Rumination'] || 0;
    if (ruminationScore > 50) {
        const q8 = responses.find(r => r.questionId === 'Q8');
        if (q8?.answer === 'D') {
            factors.push({
                domain: 'Rumination',
                contribution: 0.15,
                indicator: 'Shame after mistakes',
                description: 'Replaying mistakes repeatedly and feeling ashamed (strong depression indicator)',
            });
        }

        const q9 = responses.find(r => r.questionId === 'Q9');
        if (q9?.answer === 'D') {
            factors.push({
                domain: 'Rumination',
                contribution: 0.14,
                indicator: 'Evening worry cycle',
                description: 'Cycling through worries and regrets while trying to sleep',
            });
        }
    }

    // Social withdrawal
    const isolationScore = domainScores['Isolation'] || 0;
    if (isolationScore > 50) {
        const q11 = responses.find(r => r.questionId === 'Q11');
        if (q11?.answer === 'D') {
            factors.push({
                domain: 'Social Connection',
                contribution: 0.12,
                indicator: 'Social withdrawal',
                description: 'Feeling like an outsider in groups and reluctant to engage',
            });
        }

        const q12 = responses.find(r => r.questionId === 'Q12');
        if (q12?.answer === 'D') {
            factors.push({
                domain: 'Social Connection',
                contribution: 0.11,
                indicator: 'Reduced social initiation',
                description: 'Less likely to reach out to friends or start plans',
            });
        }
    }

    // Loss of pleasure
    const anhedoniaScore = domainScores['Anhedonia'] || 0;
    if (anhedoniaScore > 50) {
        const q30 = responses.find(r => r.questionId === 'Q30');
        if (q30?.answer === 'D') {
            factors.push({
                domain: 'Motivation & Pleasure',
                contribution: 0.13,
                indicator: 'Loss of enjoyment',
                description: 'Activities that used to bring joy feel flat or pointless',
            });
        }
    }

    // Perfectionism/pressure
    const perfectionism = domainScores['Perfectionism'] || 0;
    if (perfectionism > 50) {
        const q27 = responses.find(r => r.questionId === 'Q27');
        if (q27?.answer === 'D') {
            factors.push({
                domain: 'Perfectionism',
                contribution: 0.10,
                indicator: 'Achievement pressure',
                description: 'Academic/personal performance feels like it defines your worth',
            });
        }
    }

    return factors
        .sort((a, b) => b.contribution - a.contribution)
        .slice(0, 4); // Top 4 factors
}

export function generateExplanation(
    riskResult: RiskResult,
    responses: UserResponse[]
): SafeExplanation {
    const factors = extractMeaningfulFactors(responses, riskResult.domainScores);
    const title = getTitleForRiskLevel(riskResult.riskLevel);
    const summary = RISK_DESCRIPTIONS[riskResult.riskLevel];
    const nextSteps = NEXT_STEPS[riskResult.riskLevel];

    // Red cases don't get detailed feedback screen (immediate escalation instead)
    if (riskResult.riskLevel === 'RED') {
        return {
            riskLevel: 'RED',
            score: riskResult.totalRiskScore,
            title: 'Please Reach Out for Support',
            summary: 'Your responses suggest you\'re dealing with significant challenges. Professional support can help.',
            factors: [], // Don't provide detailed analysis for RED
            nextSteps: [
                'Contact campus counseling center immediately',
                'Call a crisis hotline if in distress',
                'Tell someone you trust how you\'re feeling',
            ],
            resources: CRISIS_RESOURCES,
            confidenceStatement: 'This assessment is non-diagnostic. A counselor will review your responses.',
            disclaimer: 'This is a screening tool, not a diagnosis. Please speak with a mental health professional.',
        };
    }

    return {
        riskLevel: riskResult.riskLevel,
        score: riskResult.totalRiskScore,
        title,
        summary,
        factors,
        nextSteps,
        resources: CRISIS_RESOURCES.slice(0, 2), // Show main resources for non-RED cases
        confidenceStatement: `This assessment is based on ${responses.length} of your responses (${Math.round(riskResult.confidenceLevel * 100)}% confidence).`,
        disclaimer: 'This is a screening tool, not a diagnosis. Only mental health professionals can diagnose conditions.',
    };
}

function getTitleForRiskLevel(level: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED'): string {
    const titles = {
        GREEN: 'You\'re Managing Well',
        YELLOW: 'Some Patterns Detected',
        ORANGE: 'Support Recommended',
        RED: 'Please Reach Out for Help',
    };
    return titles[level];
}
