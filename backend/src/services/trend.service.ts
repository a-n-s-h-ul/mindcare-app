import pool from '../db/pool';
import { StudentProfile } from './rag.service';
import { TrendAnalysis } from '../models/types';
import logger from '../utils/logger';

export class TrendService {
    /**
     * Analyze trends based on current profile and historical sessions
     */
    static async analyzeTrends(userId: string, currentProfile: StudentProfile): Promise<TrendAnalysis> {
        try {
            // 1. Fetch last 5 completed sessions
            const historyQuery = `
                SELECT 
                    s.id, 
                    s.completed_at, 
                    ds.scores as domain_scores 
                FROM survey_sessions s
                JOIN domain_scores ds ON s.id = ds.session_id
                WHERE s.user_id = $1 
                AND s.status = 'COMPLETED'
                ORDER BY s.completed_at DESC
                LIMIT 5
            `;

            const result = await pool.query(historyQuery, [userId]);
            const history = result.rows; // Most recent first (index 0 is newest in DB, but we want comparison)

            // If no previous history, return stable baseline
            if (history.length === 0) {
                return {
                    trend: 'stable',
                    riskEscalation: false,
                    significantChanges: ['First interaction establishes baseline.'],
                    historyLength: 0
                };
            }

            // 2. Identify significant changes vs most recent *previous* session
            // Note: currentProfile is from the session *just* completed, which might not be in DB yet depending on transaction order.
            // Assuming this runs before or during the transaction commit of the current session, 
            // the DB 'history' contains *previous* sessions.

            const lastSessionScores = history[0].domain_scores;
            const changes: string[] = [];
            let decliningCount = 0;
            let improvingCount = 0;

            for (const [domain, currentScore] of Object.entries(currentProfile.scores) as any) {
                const prevScore = lastSessionScores[domain.toLowerCase()] || 0;
                const delta = currentScore - prevScore;

                // >15 points is significant change on 100-point scale
                if (Math.abs(delta) > 15) {
                    const direction = delta > 0 ? 'increased' : 'decreased';
                    const context = delta > 0 ? '(Negative shift)' : '(Positive shift)'; // Higher score = worse health usually

                    // In mental health scales (usually), Higher Score = Worse Symptoms
                    if (delta > 0) decliningCount++;
                    else improvingCount++;

                    changes.push(`${domain} score ${direction} by ${Math.abs(Math.round(delta))} points ${context}`);
                }
            }

            // 3. Determine Overall Trend
            let trend: 'improving' | 'stable' | 'declining' = 'stable';
            if (decliningCount > improvingCount) trend = 'declining';
            else if (improvingCount > decliningCount) trend = 'improving';

            // 4. Check Risk Escalation
            // If critical domains (Isolation, Anhedonia) jump significantly
            const riskEscalation = (
                (currentProfile.scores['isolation'] || 0) > (lastSessionScores['isolation'] || 0) + 20 ||
                (currentProfile.scores['suicide_risk'] || 0) > (lastSessionScores['suicide_risk'] || 0) + 10
            );

            if (riskEscalation) {
                changes.push('CRITICAL: Significant escalation in risk markers detected.');
            }

            return {
                trend,
                riskEscalation,
                significantChanges: changes,
                historyLength: history.length
            };

        } catch (error) {
            logger.error('Error analyzing trends', error);
            // Fallback
            return {
                trend: 'stable',
                riskEscalation: false,
                significantChanges: [],
                historyLength: 0
            };
        }
    }
}
