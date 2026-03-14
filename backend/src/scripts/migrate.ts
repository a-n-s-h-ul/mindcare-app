import pool from '../db/pool';
import fs from 'fs';
import path from 'path';

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration...');

        const migrationsDir = path.join(__dirname, '../../migrations');
        const files = fs.readdirSync(migrationsDir).sort();

        await client.query('BEGIN');

        for (const file of files) {
            if (file.endsWith('.sql')) {
                console.log(`Running migration: ${file}`);
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                await client.query(sql);
            }
        }
        await client.query('COMMIT');

        console.log('Migration completed successfully');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
