// Script to clear all survey data
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function clearSurveyData() {
    try {
        console.log('Clearing all survey data...\n');
        
        // Clear tables in order (respecting foreign keys)
        await pool.query('DELETE FROM rag_contexts');
        console.log('✓ Cleared rag_contexts');
        
        await pool.query('DELETE FROM mentor_notes');
        console.log('✓ Cleared mentor_notes');
        
        await pool.query('DELETE FROM student_results');
        console.log('✓ Cleared student_results');
        
        await pool.query('DELETE FROM risk_flags');
        console.log('✓ Cleared risk_flags');
        
        await pool.query('DELETE FROM pattern_clusters');
        console.log('✓ Cleared pattern_clusters');
        
        await pool.query('DELETE FROM domain_scores');
        console.log('✓ Cleared domain_scores');
        
        await pool.query('DELETE FROM answers');
        console.log('✓ Cleared answers');
        
        await pool.query('DELETE FROM survey_sessions');
        console.log('✓ Cleared survey_sessions');
        
        console.log('\n✅ All survey data cleared! Fresh start ready.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

clearSurveyData();
