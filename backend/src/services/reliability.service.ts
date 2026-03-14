import { UserResponse, ResponseMetadata, ReliabilityMetrics } from '../models/types';
import logger from '../utils/logger';

export class ReliabilityService {
    // Thresholds
    private static MIN_TIME_PER_QUESTION_MS = 1500; // < 1.5s is suspicious
    private static SPEED_RUN_THRESHOLD = 0.3; // If > 30% questions are too fast

    /**
     * Calculate comprehensive reliability metrics for a session
     */
    static calculateMetrics(
        responses: UserResponse[],
        metadata: ResponseMetadata[]
    ): ReliabilityMetrics {

        const speedMetrics = this.analyzeSpeed(metadata);
        const consistencyMetrics = this.analyzeInternalConsistency(responses);

        // Base score starts at 1.0 (100%)
        let score = 1.0;

        // Penalize for speed running
        if (speedMetrics.isSpeedRunning) {
            score -= 0.3; // Significant penalty for not reading
        }

        // Penalize for inconsistencies
        if (consistencyMetrics.contradictionCount > 0) {
            score -= (consistencyMetrics.contradictionCount * 0.15);
        }

        // Clamp score 0-1
        score = Math.max(0.1, Math.min(1.0, score));

        // Determine confidence label
        let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
        if (score < 0.6) confidence = 'LOW';
        else if (score < 0.85) confidence = 'MEDIUM';

        return {
            score: Number(score.toFixed(2)),
            consistencyScore: Number((1.0 - (consistencyMetrics.contradictionCount * 0.1)).toFixed(2)),
            isSpeedRunning: speedMetrics.isSpeedRunning,
            patternStability: 'stable', // Placeholder for longitudinal check
            confidence
        };
    }

    /**
     * Analyze response times for "speed running" behavior
     */
    private static analyzeSpeed(metadata: ResponseMetadata[]) {
        if (!metadata || metadata.length === 0) return { isSpeedRunning: false };

        let fastCount = 0;

        for (const meta of metadata) {
            if (meta.timeTaken < this.MIN_TIME_PER_QUESTION_MS) {
                fastCount++;
            }
        }

        const fastRatio = fastCount / metadata.length;
        return {
            isSpeedRunning: fastRatio > this.SPEED_RUN_THRESHOLD,
            fastRatio
        };
    }

    /**
     * Check for logical contradictions in answers
     * (Reuses and expands on logic from riskScoring.ts)
     */
    private static analyzeInternalConsistency(responses: UserResponse[]) {
        let contradictionCount = 0;

        // Helper to get answer
        const getAns = (qid: string) => responses.find(r => r.questionId === qid)?.answer;

        // 1. Sleep Disruption vs Energy (Classic Check)
        // Q1 (Sleep amount) vs Q25 (Early waking)
        const q1 = getAns('Q1');
        const q25 = getAns('Q25');

        // If claims "Sleeps much longer" (Q1=C) but "Frequent early waking" (Q25=D)
        if (q1 === 'C' && q25 === 'D') {
            contradictionCount++;
        }

        // 2. Anhedonia vs Activity
        // Q30 (Enjoyment) vs Q32 (Life Satisfaction)
        const q30 = getAns('Q30');
        const q32 = getAns('Q32');

        // If "No enjoyment" (Q30=D) but "High life satisfaction" (Q32=A) -> Suspicious
        if (q30 === 'D' && q32 === 'A') {
            contradictionCount++;
        }

        return { contradictionCount };
    }
}
