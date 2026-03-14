// import { Pool } from 'pg';
// import logger from '../utils/logger';
// import { env } from './env';

// export const db = new Pool({
//     user: env.DB_USER,
//     // SAFETY: internal validation logic in env.ts ensures password exists if mode is 'password'
//     // If mode is 'trust', we explicitly do NOT send a password to Postgres
//     password: env.DB_AUTH_MODE === 'trust' ? undefined : env.DB_PASSWORD,
//     host: env.DB_HOST,
//     database: env.DB_NAME,
//     port: env.DB_PORT,
//     ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
// });

// db.on('error', (err) => logger.error('Database error:', err));
export const db = {}; // Mock
export async function query(text: string, params?: any[]) { return { rows: [] }; } // Mock


