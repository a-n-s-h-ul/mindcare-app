import pool from '../db/pool';
import fs from 'fs';
import path from 'path';

async function forceMigrate() {
    const client = await pool.connect();
    try {
        console.log('Force applying 002_mentor_system.sql...');

        const migrationFile = path.join(__dirname, '../../migrations/002_mentor_system.sql');
        const sql = fs.readFileSync(migrationFile, 'utf8');

        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');

        console.log('Migration 002 applied successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

forceMigrate();
