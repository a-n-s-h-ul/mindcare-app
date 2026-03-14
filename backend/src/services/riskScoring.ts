import { UserResponse } from '../models/types';
import { questions } from '../models/questions';

export interface DomainScore {
    [key: string]: number;
}

export interface RiskResult {
    totalRiskScore: number;
    riskLevel: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
    domainScores: DomainScore;
    compositeScores: {
        depressionRisk: number;
        anxietyRisk: number;
        burnoutRisk: number;
        lonelinesRisk: number;
    };
    maskedResponses: string[]; // Questions with inconsistencies
    confidenceLevel: number; // 0-1
}

const DOMAIN_QUESTIONS: Record<string, string[]> = {
    Sleep: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q23', 'Q24', 'Q25', 'Q26'],
    Avoidance: ['Q6', 'Q7a', 'Q19', 'Q20', 'Q21', 'Q22'],
    Rumination: ['Q8', 'Q9', 'Q10', 'Q7b', 'Q14', 'Q16', 'Q18', 'Q28'],
    Perfectionism: ['Q27', 'Q28', 'Q29'],
    Isolation: ['Q11', 'Q12', 'Q13'],
    Anhedonia: ['Q30', 'Q31', 'Q32'],
    Control: ['Q15', 'Q17', 'Q18'],
};

export function calculateDomainScores(responses: UserResponse[]): DomainScore {
    const domainScores: DomainScore = {};

    for (const [domain, questionIds] of Object.entries(DOMAIN_QUESTIONS)) {
        const domainResponses = responses.filter(r => questionIds.includes(r.questionId));
        if (domainResponses.length === 0) continue;

        const totalWeight = domainResponses.reduce((sum, r) => {
            const question = questions.find(q => q.id === r.questionId);
            return sum + (question?.weight || 1);
        }, 0);

        const weightedSum = domainResponses.reduce((sum, r) => {
            const question = questions.find(q => q.id === r.questionId);
            const score = r.answer.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
            return sum + (score * (question?.weight || 1));
        }, 0);

        if (totalWeight > 0) {
            domainScores[domain] = Math.min(100, (weightedSum / totalWeight) * 33.33);
        } else {
            domainScores[domain] = 0;
        }
    }

    return domainScores;
}

export function calculateCompositeRisks(domainScores: DomainScore) {
    const scores = {
        Sleep: domainScores['Sleep'] || 0,
        Anhedonia: domainScores['Anhedonia'] || 0,
        Rumination: domainScores['Rumination'] || 0,
        Isolation: domainScores['Isolation'] || 0,
        Avoidance: domainScores['Avoidance'] || 0,
        Perfectionism: domainScores['Perfectionism'] || 0,
        Control: domainScores['Control'] || 0,
    };

    const depressionRisk = (scores.Sleep * 0.25) + (scores.Anhedonia * 0.30) +
        (scores.Rumination * 0.20) + (scores.Isolation * 0.15) + (scores.Avoidance * 0.10);

    const anxietyRisk = (scores.Sleep * 0.20) + (scores.Rumination * 0.25) +
        (scores.Perfectionism * 0.30) + (scores.Avoidance * 0.15) + (scores.Control * 0.10);

    const burnoutRisk = (scores.Perfectionism * 0.35) + (scores.Rumination * 0.25) +
        (scores.Avoidance * 0.20) + (scores.Sleep * 0.10) + (scores.Control * 0.10);

    const lonelinesRisk = (scores.Isolation * 0.70) + (scores.Avoidance * 0.30);

    return {
        depressionRisk: Math.min(100, depressionRisk),
        anxietyRisk: Math.min(100, anxietyRisk),
        burnoutRisk: Math.min(100, burnoutRisk),
        lonelinesRisk: Math.min(100, lonelinesRisk),
    };
}

export function calculateTotalRiskScore(composites: any): number {
    return (composites.depressionRisk * 0.35) +
        (composites.anxietyRisk * 0.30) +
        (composites.burnoutRisk * 0.20) +
        (composites.lonelinesRisk * 0.15);
}

export function getRiskLevel(score: number): 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' {
    if (score <= 20) return 'GREEN';
    if (score <= 40) return 'YELLOW';
    if (score <= 60) return 'ORANGE';
    return 'RED';
}

export function detectInconsistencies(responses: UserResponse[]): { masked: string[], confidenceBoost: number } {
    const masked: string[] = [];
    let confidenceBoost = 0;

    // Sleep disruption denial pattern
    const q1 = responses.find(r => r.questionId === 'Q1')?.answer;
    const q25 = responses.find(r => r.questionId === 'Q25')?.answer;
    const q2 = responses.find(r => r.questionId === 'Q2')?.answer;

    if (q1 === 'A' && q25 === 'D' && q2 === 'D') {
        masked.push('Q1'); // Likely being defensive about sleep
        confidenceBoost += 0.15;
    }

    // Anhedonia denial
    const q30 = responses.find(r => r.questionId === 'Q30')?.answer;
    const q31 = responses.find(r => r.questionId === 'Q31')?.answer;
    const q12 = responses.find(r => r.questionId === 'Q12')?.answer;

    if ((q30 === 'A' || q31 === 'A') && q12 === 'D') {
        masked.push('Q30');
        confidenceBoost += 0.12;
    }

    return { masked, confidenceBoost };
}

export function assessCriticalRisks(responses: UserResponse[]): { isCritical: boolean; reasons: string[] } {
    const reasons: string[] = [];

    // Suicide risk assessment
    const q10 = responses.find(r => r.questionId === 'Q10')?.answer;
    const q32 = responses.find(r => r.questionId === 'Q32')?.answer;
    const q31 = responses.find(r => r.questionId === 'Q31')?.answer;

    if (q10 === 'D' && q32 === 'D') {
        reasons.push('Hopelessness + Life dissatisfaction');
    }

    if (q10 === 'D' && q32 === 'D' && q31 === 'D') {
        reasons.push('Hopelessness + Dissatisfaction + Emotional numbness = Elevated suicide risk');
    }

    // Isolation + hopelessness
    const q11 = responses.find(r => r.questionId === 'Q11')?.answer;
    const q12 = responses.find(r => r.questionId === 'Q12')?.answer;
    const q13 = responses.find(r => r.questionId === 'Q13')?.answer;

    if (q11 === 'D' && q12 === 'D' && q13 === 'D' && q10 === 'D') {
        reasons.push('Social isolation triad + hopelessness');
    }

    return {
        isCritical: reasons.length > 0,
        reasons,
    };
}

export function scoreResponse(responses: UserResponse[]): RiskResult {
    const domainScores = calculateDomainScores(responses);
    const composites = calculateCompositeRisks(domainScores);
    let totalRiskScore = calculateTotalRiskScore(composites);

    const { masked, confidenceBoost } = detectInconsistencies(responses);
    const { isCritical, reasons: _criticalReasons } = assessCriticalRisks(responses);

    // Boost risk if critical patterns detected
    if (isCritical) {
        totalRiskScore = Math.min(100, Math.max(65, totalRiskScore + 20)); // Ensure it hits RED range if critical
    } else {
        totalRiskScore = Math.min(100, totalRiskScore + (confidenceBoost * 100));
    }

    let confidence = Math.min(1, 0.5 + (responses.length / 40) * 0.5);
    confidence = Math.min(1, confidence + confidenceBoost);

    return {
        totalRiskScore,
        riskLevel: isCritical ? 'RED' : getRiskLevel(totalRiskScore),
        domainScores,
        compositeScores: composites,
        maskedResponses: masked,
        confidenceLevel: confidence,
    };
}
