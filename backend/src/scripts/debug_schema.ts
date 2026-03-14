
import pool from '../db/pool';

async function debugSchema() {
    console.log('--- STARTING DEBUG ---');
    try {
        // 1. Check current columns
        console.log('Checking current columns in users table...');
        const res1 = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        console.table(res1.rows.map(r => ({ name: r.column_name, type: r.data_type })));

        // 2. Try to add the column directly
        console.log('Attempting to add column "role" directly...');
        try {
            await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'admin'));");
            console.log('ALTER TABLE command executed successfully.');
        } catch (alterErr) {
            console.error('ALTER TABLE failed:', alterErr);
        }

        // 3. Check again
        console.log('Checking columns AFTER attempt...');
        const res2 = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        console.table(res2.rows.map(r => ({ name: r.column_name, type: r.data_type })));

        // 4. Check tables existence
        const resTables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);
        console.log('Tables in public schema:', resTables.rows.map(r => r.table_name));

    } catch (err) {
        console.error('General Debug Error:', err);
    } finally {
        await pool.end();
        console.log('--- END DEBUG ---');
    }
}

debugSchema();
