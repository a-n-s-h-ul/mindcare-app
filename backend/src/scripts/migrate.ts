import pool from '../db/pool';
import fs from 'fs';
import path from 'path';

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration...');

        // 1. Create tracking table if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS migrations_tracking (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) UNIQUE NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Get already executed migrations
        const { rows } = await client.query('SELECT filename FROM migrations_tracking');
        const executedMigrations = new Set(rows.map((r: any) => r.filename));

        const migrationsDir = path.join(__dirname, '../../migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        for (const file of files) {
            if (executedMigrations.has(file)) {
                console.log(`Skipping already executed migration: ${file}`);
                continue;
            }

            console.log(`Running migration: ${file}`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            
            await client.query('BEGIN');
            try {
                await client.query(sql);
                await client.query('INSERT INTO migrations_tracking (filename) VALUES ($1)', [file]);
                await client.query('COMMIT');
            } catch (innerErr) {
                await client.query('ROLLBACK');
                throw innerErr;
            }
        }

        console.log('Migration completed successfully');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
