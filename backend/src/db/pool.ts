import { Pool } from 'pg';
import { env } from '../config/env';

const poolConfig = env.DATABASE_URL
    ? {
        connectionString: env.DATABASE_URL,
        ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }
    : {
        host: env.DB_HOST,
        port: parseInt(String(env.DB_PORT || '5432')),
        user: env.DB_USER,
        password: env.DB_PASSWORD || '',
        database: env.DB_NAME,
        ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };

const pool = new Pool(poolConfig);

// Test connection
pool.on('connect', () => {
    console.log('Database connected successfully');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;
