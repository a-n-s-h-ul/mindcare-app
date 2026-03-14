// Analysis Service: Handles scoring, pattern recognition, and risk assessment
import { questions } from '../models/questions';

// Domain mapping for normalized scores (0-100)
const DOMAINS = ['Sleep', 'Avoidance', 'Rumination', 'Isolation', 'Control', 'Perfectionism', 'Anhedonia'];

export class AnalysisService {
    // 1. Real Scoring Logic - Calculate from actual responses
    static calculateDomainScores(answers: Array<{ questionId: string; answer: number }>) {
        // Initialize domain data
        const domainData: Record<string, { totalWeight: number; weightedScore: number }> = {};
        DOMAINS.forEach(domain => {
            domainData[domain] = { totalWeight: 0, weightedScore: 0 };
        });

        // Process each answer
        for (const response of answers) {
            const question = questions.find(q => q.id === response.questionId);
            if (!question) continue;

            // Get domains for this question (could be multiple)
            const questionDomains = question.domain || [];
            const weight = question.weight || 1;
            const maxScore = 3; // Options are 0-3

            // Normalize answer to 0-100 scale
            const normalizedScore = (response.answer / maxScore) * 100;

            // Add to each domain this question belongs to
            for (const domain of questionDomains) {
                if (domainData[domain]) {
                    domainData[domain].totalWeight += weight;
                    domainData[domain].weightedScore += normalizedScore * weight;
                }
            }
        }

        // Calculate final scores (weighted average per domain)
        const scores: Record<string, number> = {};
        for (const domain of DOMAINS) {
            if (domainData[domain].totalWeight > 0) {
                scores[domain.toLowerCase()] = Math.round(
                    domainData[domain].weightedScore / domainData[domain].totalWeight
                );
            } else {
                scores[domain.toLowerCase()] = 0; // No data for this domain
            }
        }

        return scores;
    }

    // 2. Pattern Recognition - Based on actual scores
    static detectPatterns(scores: Record<string, number>, answers: Array<{ questionId: string; answer: number }>) {
        const patterns = [];

        // Depression-Sleep Cluster
        if ((scores.sleep || 0) > 50 && (scores.anhedonia || 0) > 40) {
            patterns.push({
                name: 'Depression-Sleep Cluster',
                confidence: Math.min(0.95, ((scores.sleep + scores.anhedonia) / 200) + 0.5),
                description: 'Sleep disruption coupled with reduced pleasure/interest indicators',
                contributors: answers.filter(a => {
                    const q = questions.find(q => q.id === a.questionId);
                    return q?.domain?.includes('Sleep') || q?.domain?.includes('Anhedonia');
                }).slice(0, 3).map(a => a.questionId)
            });
        }

        // Isolation-Withdrawal Pattern
        if ((scores.isolation || 0) > 50) {
            patterns.push({
                name: 'Isolation-Withdrawal',
                confidence: Math.min(0.95, (scores.isolation / 100) + 0.4),
                description: 'Social withdrawal pattern detected',
                contributors: answers.filter(a => {
                    const q = questions.find(q => q.id === a.questionId);
                    return q?.domain?.includes('Isolation');
                }).slice(0, 3).map(a => a.questionId)
            });
        }

        // Rumination-Anxiety Pattern
        if ((scores.rumination || 0) > 45) {
            patterns.push({
                name: 'Rumination-Worry Cycle',
                confidence: Math.min(0.95, (scores.rumination / 100) + 0.35),
                description: 'Persistent worry and overthinking patterns',
                contributors: answers.filter(a => {
                    const q = questions.find(q => q.id === a.questionId);
                    return q?.domain?.includes('Rumination');
                }).slice(0, 3).map(a => a.questionId)
            });
        }

        // Perfectionism Pattern
        if ((scores.perfectionism || 0) > 50) {
            patterns.push({
                name: 'Maladaptive Perfectionism',
                confidence: Math.min(0.95, (scores.perfectionism / 100) + 0.4),
                description: 'Self-worth tied to achievement, fear of failure',
                contributors: answers.filter(a => {
                    const q = questions.find(q => q.id === a.questionId);
                    return q?.domain?.includes('Perfectionism');
                }).slice(0, 3).map(a => a.questionId)
            });
        }

        // Avoidance Pattern
        if ((scores.avoidance || 0) > 45) {
            patterns.push({
                name: 'Behavioral Avoidance',
                confidence: Math.min(0.95, (scores.avoidance / 100) + 0.35),
                description: 'Task avoidance and passive coping strategies',
                contributors: answers.filter(a => {
                    const q = questions.find(q => q.id === a.questionId);
                    return q?.domain?.includes('Avoidance');
                }).slice(0, 3).map(a => a.questionId)
            });
        }

        return patterns;
    }

    // 3. Risk Stratification
    static assessRisk(scores: Record<string, number>, patterns: any[], audioContext?: Array<{ transcript: string; mood: string; confidence: string }>) {
        let riskLevel = 'low';
        const flags: Record<string, string> = {
            suicide_risk: 'LOW',
            self_harm: 'LOW',
            severe_depression: 'NO',
            needs_immediate: 'NO'
        };

        // Calculate average of critical domains
        const criticalAvg = (
            (scores.anhedonia || 0) +
            (scores.isolation || 0) +
            (scores.rumination || 0)
        ) / 3;

        // Risk level determination
        if (criticalAvg > 70 || (scores.anhedonia || 0) > 75) {
            riskLevel = 'critical';
            flags.severe_depression = 'YES';
            flags.needs_immediate = 'YES';
        } else if (criticalAvg > 55 || (scores.isolation || 0) > 65) {
            riskLevel = 'high';
            flags.severe_depression = 'POSSIBLE';
        } else if (criticalAvg > 40) {
            riskLevel = 'moderate';
        }

        // --- Voice Risk Detection (Phase C) ---
        if (audioContext && audioContext.length > 0) {
            const highRiskKeywords = ['kill myself', 'suicide', 'end it all', 'die', 'no point left', 'hurt myself', 'giving up'];
            
            for (const item of audioContext) {
                const text = item.transcript.toLowerCase();
                const hasSuicidalTalk = highRiskKeywords.some(kw => text.includes(kw));
                const isDepressedMood = item.mood.toLowerCase() === 'depressed' || item.mood.toLowerCase() === 'anxious';

                if (hasSuicidalTalk) {
                    riskLevel = 'critical';
                    flags.suicide_risk = 'HIGH';
                    flags.needs_immediate = 'YES';
                } else if (isDepressedMood && riskLevel === 'low') {
                    riskLevel = 'moderate';
                    flags.severe_depression = 'POSSIBLE';
                }
            }
        }

        // Check for isolation-based suicide risk indicators (Survey-based)
        if ((scores.isolation || 0) > 70 && (scores.anhedonia || 0) > 60) {
            flags.suicide_risk = 'MODERATE';
        }
        if ((scores.isolation || 0) > 80 && flags.suicide_risk === 'LOW') {
            flags.suicide_risk = 'HIGH';
        }

        return {
            overall_risk: riskLevel,
            flags
        };
    }

    // 4. Report Generation (Aggregator)
    static generateClinicalProfile(answers: Array<{ questionId: string; answer: number }>, audioContext?: any[]) {
        const scores = this.calculateDomainScores(answers);
        const patterns = this.detectPatterns(scores, answers);
        const risk = this.assessRisk(scores, patterns, audioContext);

        return {
            scores,
            patterns,
            risk
        };
    }
}
