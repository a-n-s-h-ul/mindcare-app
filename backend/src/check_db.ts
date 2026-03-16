import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:secret_password_here@localhost:5432/kiit_mh'
});

async function check() {
    try {
        const result = await pool.query('SELECT id, session_id, question_id, transcript, predicted_mood FROM audio_mood_analysis ORDER BY created_at DESC LIMIT 10');
        console.log('Results (JSON):', JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error('Error querying DB:', err);
    } finally {
        await pool.end();
    }
}

check();
