
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'kiit_mh',
    connectionTimeoutMillis: 2000, // 2s timeout
});

console.log('--- CONFIG CHECK ---');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('User:', process.env.DB_USER);
console.log('DB:', process.env.DB_NAME);

async function debugSchema() {
    console.log('--- STARTING DEBUG (JS) ---');
    console.log(`Connecting to ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    
    try {
        const client = await pool.connect();
        console.log('Connected!');
        
        // 1. Check current columns
        console.log('Checking current columns in users table...');
        const res1 = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        console.table(res1.rows);

        // 2. Try to add the column directly
        console.log('Attempting to add column "role" directly...');
        try {
            await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'admin'));");
            console.log('ALTER TABLE command executed successfully.');
        } catch (alterErr) {
            console.error('ALTER TABLE failed:', alterErr.message);
        }

        // 3. Check again
        console.log('Checking columns AFTER attempt...');
        const res2 = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        console.table(res2.rows);

        client.release();
    } catch (err) {
        console.error('General Debug Error:', err);
    } finally {
        await pool.end();
        console.log('--- END DEBUG ---');
    }
}

debugSchema();
