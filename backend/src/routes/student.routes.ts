import express from 'express';
import pool from '../db/pool';
import { authenticate, requireStudent, AuthRequest } from '../middleware/auth.middleware';
import logger from '../utils/logger';

const router = express.Router();

// ==========================================
// STUDENT HOME & CONTINUITY ROUTES
// ==========================================

/**
 * GET /api/student/home
 * Student Dashboard Data: Past check-ins, journey continuity
 */
router.get('/home', authenticate, requireStudent, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.id;

        // Get completed sessions for this student
        const sessionsResult = await pool.query(`
            SELECT 
                ss.id,
                ss.completed_at,
                ds.scores as domain_scores
            FROM survey_sessions ss
            LEFT JOIN domain_scores ds ON ds.session_id = ss.id
            WHERE ss.user_id = $1 AND ss.status = 'COMPLETED'
            ORDER BY ss.completed_at DESC
        `, [userId]);

        // Transform to student-safe format (NO risk levels, NO clinical data)
        const recentCheckIns = sessionsResult.rows.slice(0, 5).map(row => {
            // Generate a simple human reflection (NOT scores/risks)
            const reflection = generateHumanReflection(row.domain_scores);
            return {
                id: row.id,
                completedAt: row.completed_at,
                reflection
            };
        });

        res.json({
            totalCheckIns: sessionsResult.rows.length,
            lastCheckIn: sessionsResult.rows[0]?.completed_at || null,
            recentCheckIns
        });

    } catch (err: any) {
        logger.error('Failed to load student home', err);
        res.status(500).json({ error: 'Failed to load your space' });
    }
});

/**
 * GET /api/student/reflection/:sessionId
 * Get safe reflection data for a specific session
 */
router.get('/reflection/:sessionId', authenticate, requireStudent, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.id;
        const { sessionId } = req.params;

        // Verify ownership
        const sessionResult = await pool.query(`
            SELECT 
                ss.id,
                ss.completed_at,
                ds.scores as domain_scores,
                (SELECT COUNT(*) FROM answers WHERE session_id = ss.id) as response_count
            FROM survey_sessions ss
            LEFT JOIN domain_scores ds ON ds.session_id = ss.id
            WHERE ss.id = $1 AND ss.user_id = $2 AND ss.status = 'COMPLETED'
        `, [sessionId, userId]);

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Check-in not found' });
        }

        const session = sessionResult.rows[0];

        // Generate student-safe reflection
        const wellbeingAreas = generateWellbeingAreas(session.domain_scores);
        const reflection = generateHumanReflection(session.domain_scores);

        res.json({
            id: session.id,
            completedAt: session.completed_at,
            responseCount: session.response_count,
            reflection,
            wellbeingAreas,
            // What happens next - Clarity Layer
            nextSteps: {
                message: "Your responses have been received. If we think a conversation might help, a support mentor may reach out to you.",
                canReachOut: true,
                supportEmail: "wellness@kiit.ac.in"
            }
        });

    } catch (err: any) {
        logger.error('Failed to load reflection', err);
        res.status(500).json({ error: 'Failed to load reflection' });
    }
});

/**
 * GET /api/student/history
 * Full check-in history for continuity view
 */
router.get('/history', authenticate, requireStudent, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.id;

        const sessionsResult = await pool.query(`
            SELECT 
                ss.id,
                ss.completed_at,
                (SELECT COUNT(*) FROM answers WHERE session_id = ss.id) as response_count
            FROM survey_sessions ss
            WHERE ss.user_id = $1 AND ss.status = 'COMPLETED'
            ORDER BY ss.completed_at DESC
        `, [userId]);

        const history = sessionsResult.rows.map((row, index) => ({
            id: row.id,
            completedAt: row.completed_at,
            responseCount: row.response_count,
            label: `Check-in #${sessionsResult.rows.length - index}`
        }));

        res.json({
            total: history.length,
            checkIns: history
        });

    } catch (err: any) {
        logger.error('Failed to load history', err);
        res.status(500).json({ error: 'Failed to load history' });
    }
});

// ==========================================
// HELPER FUNCTIONS (Student-Safe Language)
// ==========================================

/**
 * Generate human-readable reflection from domain scores
 * NO clinical terms, NO risk levels, NO AI language
 */
function generateHumanReflection(scores: Record<string, number> | null): string {
    if (!scores || Object.keys(scores).length === 0) {
        return "You completed a check-in.";
    }

    const highAreas = Object.entries(scores)
        .filter(([_, score]) => score > 60)
        .map(([domain]) => domain.toLowerCase());

    if (highAreas.length === 0) {
        return "Things seem balanced right now. Keep taking care of yourself.";
    }

    // Map domains to human-friendly language
    const friendlyMap: Record<string, string> = {
        sleep: "rest and sleep",
        rumination: "thinking patterns",
        isolation: "connection with others",
        anhedonia: "enjoyment and interest",
        avoidance: "facing daily tasks",
        perfectionism: "self-expectations",
        control: "feeling in control"
    };

    const friendlyAreas = highAreas
        .map(a => friendlyMap[a] || a)
        .slice(0, 2)
        .join(" and ");

    return `You might be navigating some things around ${friendlyAreas}. That's okay — awareness is the first step.`;
}

/**
 * Generate wellbeing areas summary (for reflection page)
 */
function generateWellbeingAreas(scores: Record<string, number> | null): Array<{ area: string; status: string }> {
    if (!scores) return [];

    const areaMap: Record<string, string> = {
        sleep: "Rest & Sleep",
        rumination: "Thoughts & Worries",
        isolation: "Social Connection",
        anhedonia: "Interest & Enjoyment",
        avoidance: "Motivation",
        perfectionism: "Self-Compassion",
        control: "Feeling Grounded"
    };

    return Object.entries(scores)
        .filter(([domain]) => areaMap[domain])
        .slice(0, 4)
        .map(([domain, score]) => ({
            area: areaMap[domain],
            status: score > 60 ? "Worth some attention" : score > 40 ? "Okay" : "Doing well"
        }));
}

export default router;
