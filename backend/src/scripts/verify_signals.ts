import { ReliabilityService } from '../services/reliability.service';
import { UserResponse, ResponseMetadata } from '../models/types';
import pool from '../db/pool';

console.log('Script started...');

async function verifyReliabilityLogic() {
    console.log('--- Verifying Reliability Service Logic ---');

    const mockResponses: UserResponse[] = [
        { questionId: 'Q1', answer: 'C', timestamp: new Date().toISOString() }, // Sleep++
        { questionId: 'Q25', answer: 'D', timestamp: new Date().toISOString() }, // Early wake (Contradiction!)
        { questionId: 'Q30', answer: 'D', timestamp: new Date().toISOString() }, // Low joy
        { questionId: 'Q32', answer: 'A', timestamp: new Date().toISOString() }, // High satisfaction (Contradiction!)
        // Fillers
        { questionId: 'Q2', answer: 'B', timestamp: new Date().toISOString() },
    ];

    const mockMetadata: ResponseMetadata[] = [
        { questionId: 'Q1', timeTaken: 500, changeCount: 0 }, // Too fast
        { questionId: 'Q25', timeTaken: 400, changeCount: 0 }, // Too fast
        { questionId: 'Q30', timeTaken: 2000, changeCount: 1 },
        { questionId: 'Q32', timeTaken: 3000, changeCount: 0 },
        { questionId: 'Q2', timeTaken: 600, changeCount: 0 }, // Too fast
    ];

    console.log('Calculating metrics...');
    const result = ReliabilityService.calculateMetrics(mockResponses, mockMetadata);

    console.log('Calculated Metrics:', JSON.stringify(result, null, 2));

    const passed =
        result.isSpeedRunning === true && // 3/5 < 1500ms -> 60% > 30% threshold
        result.consistencyScore < 1.0 && // Should have penalties
        result.confidence === 'LOW';

    if (passed) {
        console.log('✅ Reliability Logic Verification PASSED');
    } else {
        console.error('❌ Reliability Logic Verification FAILED');
        // Don't exit here, continue to DB check
    }
}

async function verifyDatabaseSchema() {
    console.log('\n--- Verifying Database Schema ---');
    try {
        console.log('Querying information_schema...');
        const tableQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('response_metadata', 'reliability_metrics', 'submission_metadata');
        `;

        const res = await pool.query(tableQuery);
        const foundTables = res.rows.map(r => r.table_name);

        console.log('Found tables:', foundTables);

        const missing = ['response_metadata', 'reliability_metrics', 'submission_metadata']
            .filter(t => !foundTables.includes(t));

        if (missing.length === 0) {
            console.log('✅ Schema Verification PASSED');
        } else {
            console.error('❌ Schema Verification FAILED. Missing:', missing);
        }
    } catch (err) {
        console.error('DB Check Failed:', err);
    } finally {
        console.log('Closing DB pool...');
        await pool.end();
        console.log('DB pool closed.');
    }
}

async function run() {
    try {
        await verifyReliabilityLogic();
        await verifyDatabaseSchema();
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

run();
