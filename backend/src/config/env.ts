import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env file
dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('3001').transform(Number),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Database
    // Database
    DB_AUTH_MODE: z.enum(['trust', 'password']).optional().default('trust'),
    DB_HOST: z.string().optional(),
    DB_PORT: z.string().default('5432').transform(Number),
    DB_USER: z.string().optional(),
    DB_PASSWORD: z.string().optional(),
    DB_NAME: z.string().optional(),

    // Security
    ENCRYPTION_KEY: z.string().length(32, "ENCRYPTION_KEY must be exactly 32 characters"),
    JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 characters"),

    // Email Configuration (Optional)
    EMAIL_USER: z.string().optional(),
    EMAIL_APP_PASSWORD: z.string().optional(),

    // OAuth
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
});

// Validate and export
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("❌ Invalid environment variables:", _env.error.format());
    process.exit(1);
}

export const env = _env.data;
