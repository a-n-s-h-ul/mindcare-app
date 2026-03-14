import { TrendService } from '../services/trend.service';
import { ReliabilityService } from '../services/reliability.service';
import { StudentProfile } from '../services/rag.service';
import pool from '../db/pool';
import { v4 as uuidv4 } from 'uuid';

console.log('--- Starting System Verification ---');

async function runVerification() {
    const testUserId = 'TEST_USER_VERIFY_' + uuidv4().substring(0, 8);
    // Use a unique email to avoid unique constant violation
    const testEmail = `test_${Date.now()}_${uuidv4().substring(0, 4)}@example.com`;

    try {
        console.log('1. Creating Test User:', testUserId);
        // Create user
        await pool.query(
            `INSERT INTO users (id, email, password_hash, role, full_name, created_at)
             VALUES ($1, $2, 'hash', 'student', 'Test User', NOW())`,
            [testUserId, testEmail]
        );

        // --- SESSION 1: HEALTHY BASELINE ---
        console.log('\n2. Creating Session 1 (Historical Baseline - 1 week ago)');
        const session1Id = uuidv4();
        // Insert completed session
        await pool.query(
            `INSERT INTO survey_sessions (id, user_id, status, started_at, completed_at)
             VALUES ($1, $2, 'COMPLETED', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days')`,
            [session1Id, testUserId]
        );

        // Insert domain scores for Session 1 (Low Risk)
        const scores1 = { sleep: 20, anxiety: 30, isolation: 10, anhedonia: 10 };
        await pool.query(
            `INSERT INTO domain_scores (user_id, session_id, scores, created_at)
             VALUES ($1, $2, $3, NOW() - INTERVAL '7 days')`,
            [testUserId, session1Id, JSON.stringify(scores1)]
        );

        // --- SESSION 2: CURRENT (Deteriorating) ---
        console.log('\n3. Simulating Session 2 (Current - Deteriorating)');
        const currentProfile: StudentProfile = {
            scores: { sleep: 80, anxiety: 70, isolation: 60, anhedonia: 50 }, // Significant increase!
            patterns: [],
            risk: { overall_risk: 'high', flags: { severe_depression: 'POSSIBLE' } }
        };

        // --- TEST TREND SERVICE ---
        console.log('\n4. Testing TrendService logic...');
        const trends = await TrendService.analyzeTrends(testUserId, currentProfile);

        console.log('Trend Analysis Result:', JSON.stringify(trends, null, 2));

        // EXPECTATIONS:
        // Sleep: 20 -> 80 (+60 increase)
        // Anxiety: 30 -> 70 (+40 increase)
        // Isolation: 10 -> 60 (+50 increase)
        // Anhedonia: 10 -> 50 (+40 increase)
        // Total significant changes: 4
        // Risk Escalation: True (Isolation > +20)
        // Trend: Declining

        const trendPass =
            trends.trend === 'declining' &&
            trends.riskEscalation === true &&
            trends.significantChanges.length >= 3;

        if (trendPass) {
            console.log('✅ Trend Analysis Logic PASSED');
        } else {
            console.error('❌ Trend Analysis Logic FAILED');
        }

        // --- TEST RELIABILITY SERVICE ---
        console.log('\n5. Testing ReliabilityService logic...');
        const mockResponses = [
            { questionId: 'Q1', answer: 'C', timestamp: new Date().toISOString() },
            { questionId: 'Q25', answer: 'D', timestamp: new Date().toISOString() } // Contradiction
        ];
        const mockMetadata = [
            { questionId: 'Q1', timeTaken: 500, changeCount: 0 }, // Fast
            { questionId: 'Q25', timeTaken: 600, changeCount: 0 } // Fast
        ];

        const reliability = ReliabilityService.calculateMetrics(mockResponses as any, mockMetadata as any);
        console.log('Reliability Result:', JSON.stringify(reliability, null, 2));

        const relPass =
            reliability.isSpeedRunning === true &&
            reliability.consistencyScore < 1.0 &&
            reliability.confidence === 'LOW';

        if (relPass) {
            console.log('✅ Reliability Logic PASSED');
        } else {
            console.error('❌ Reliability Logic FAILED');
        }

    } catch (err) {
        console.error('Verification Failed:', err);
    } finally {
        console.log('\nCleaning up...');
        await pool.query(`DELETE FROM domain_scores WHERE user_id = $1`, [testUserId]);
        await pool.query(`DELETE FROM survey_sessions WHERE user_id = $1`, [testUserId]);
        await pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);
        await pool.end();
        console.log('Done.');
    }
}

runVerification();
