import express from 'express';
import cors from 'cors';
import { env } from './config/env'; // Validation happens here
import surveyRoutes from './routes/survey';

import responsesRoutes from './routes/responses';

import authRoutes from './routes/auth';
import mentorRoutes from './routes/mentor.routes';
import ragRoutes from './routes/rag.routes';
import studentRoutes from './routes/student.routes';

const app = express();
const PORT = env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/responses', responsesRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/student', studentRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start Server
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    // TEMPORARY FIX: Apply Migration
    try {
        const { default: pool } = await import('./db/pool');
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'admin'))");
        console.log("✅ SCHEMA FIX APPLIED: Role column added.");
    } catch (e) {
        console.log("ℹ️ Schema Fix Result:", (e as any).message);
    }
});
