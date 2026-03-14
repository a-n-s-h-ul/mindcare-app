import express from 'express';
import pool from '../db/pool';
import { authenticate, requireMentor, AuthRequest } from '../middleware/auth.middleware';
import { RagService } from '../services/rag.service';
import { AnalysisService } from '../services/analysis.service';
import logger from '../utils/logger';

const router = express.Router();

// ==========================================
// MENTOR DASHBOARD ROUTES
// ==========================================

/**
 * GET /api/mentor/dashboard
 * Orientation Layer: Situation Report & Priority Queue
 */
router.get('/dashboard', authenticate, requireMentor, async (req: AuthRequest, res) => {
    try {
        // 1. Fetch all students with latest context
        const studentsQuery = await pool.query(`
            SELECT 
                u.id,
                u.email,
                u.roll_no,
                u.last_login,
                ss.id as latest_session_id,
                ss.completed_at as last_survey_date,
                rf.overall_risk,
                rf.flags as risk_flags,
                pc.clusters as pattern_clusters,
                ds.scores as domain_scores
            FROM users u
            LEFT JOIN LATERAL (
                SELECT * FROM survey_sessions 
                WHERE user_id = u.id AND status = 'COMPLETED'
                ORDER BY completed_at DESC 
                LIMIT 1
            ) ss ON true
            LEFT JOIN risk_flags rf ON rf.session_id = ss.id
            LEFT JOIN pattern_clusters pc ON pc.session_id = ss.id
            LEFT JOIN domain_scores ds ON ds.session_id = ss.id
            WHERE u.role = 'student'
        `);

        // 2. Process & Prioritize (The "Brain" of the Orientation Layer)
        const processedStudents = studentsQuery.rows.map(s => {
            // Calculate Urgency Score (0-100)
            let urgencyScore = 0;
            const daysSinceSurvey = s.last_survey_date
                ? Math.floor((Date.now() - new Date(s.last_survey_date).getTime()) / (1000 * 60 * 60 * 24))
                : 999;

            // Base risk score
            if (s.overall_risk === 'critical') urgencyScore += 90;
            else if (s.overall_risk === 'high') urgencyScore += 70;
            else if (s.overall_risk === 'moderate') urgencyScore += 40;

            // Recency factor (more urgent if recent critical, or if silence > 30 days for high risk)
            if (s.overall_risk === 'critical' && daysSinceSurvey < 3) urgencyScore += 10; // Immediate attention
            if (s.overall_risk === 'high' && daysSinceSurvey > 14) urgencyScore += 15; // Drift risk

            return {
                id: s.id,
                email: s.email,
                rollNo: s.roll_no,
                lastActivity: s.last_survey_date || s.last_login,
                riskLevel: s.overall_risk || 'not_assessed',
                urgencyScore: Math.min(urgencyScore, 100),
                flags: s.risk_flags || {},
                domains: s.domain_scores || {},
                // Tier 1 insights for dashboard (Minimal cognitive load)
                topConcerns: Object.entries(s.domain_scores || {})
                    .filter(([_, val]) => (val as number) > 60)
                    .map(([key]) => key),
                daysSinceCheck: daysSinceSurvey === 999 ? null : daysSinceSurvey
            };
        });

        // 3. Generate Situation Report
        const priorityQueue = processedStudents
            .filter(s => s.urgencyScore > 30) // Only relevant cases
            .sort((a, b) => b.urgencyScore - a.urgencyScore);

        const dailyMetric = {
            urgentCount: processedStudents.filter(s => s.urgencyScore > 80).length,
            newRisks24h: processedStudents.filter(s => s.daysSinceCheck === 0 && s.riskLevel !== 'low').length,
            pendingReviews: priorityQueue.length
        };

        res.json({
            meta: {
                generatedAt: new Date().toISOString(),
                type: 'orientation_briefing'
            },
            metrics: dailyMetric,
            priorityQueue: priorityQueue, // The focus list
            directory: processedStudents.map(s => ({ // searchable full list
                ...s,
                urgencyScore: undefined // Hide score from directory view to reduce noise
            }))
        });

    } catch (err: any) {
        logger.error('Failed to generate orientation report', err);
        res.status(500).json({ error: 'System error: Orientation layer failed' });
    }
});

/**
 * GET /api/mentor/student/:id
 * Get detailed student profile with all analysis
 */
router.get('/student/:id', authenticate, requireMentor, async (req: AuthRequest, res) => {
    try {
        const studentId = req.params.id;

        // 1. Get student info
        const userResult = await pool.query(
            'SELECT id, email, roll_no, created_at, last_login FROM users WHERE id = $1 AND role = $2',
            [studentId, 'student']
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const student = userResult.rows[0];

        // 2. Get COMPLETED survey sessions only (filter out in-progress)
        const sessionsResult = await pool.query(`
            SELECT 
                ss.id, ss.status, ss.started_at, ss.completed_at, ss.total_questions,
                ds.scores as domain_scores,
                pc.clusters as pattern_clusters,
                rf.flags as risk_flags, rf.overall_risk,
                sr.id as result_id,
                (SELECT COUNT(*) FROM answers WHERE session_id = ss.id) as answer_count,
            (SELECT AVG(time_taken_ms) FROM response_metadata WHERE session_id = ss.id) as avg_time_ms
            FROM survey_sessions ss
            LEFT JOIN domain_scores ds ON ds.session_id = ss.id
            LEFT JOIN pattern_clusters pc ON pc.session_id = ss.id
            LEFT JOIN risk_flags rf ON rf.session_id = ss.id
            LEFT JOIN student_results sr ON sr.session_id = ss.id
            WHERE ss.user_id = $1 AND ss.status = 'COMPLETED'
            ORDER BY ss.started_at DESC
        `, [studentId]);

        // 3. Get mentor notes
        const notesResult = await pool.query(`
            SELECT mn.id, mn.content, mn.created_at, mn.is_private, u.email as mentor_email
            FROM mentor_notes mn
            JOIN mentors m ON mn.mentor_id = m.id
            JOIN users u ON m.user_id = u.id
            WHERE mn.student_id = $1
            ORDER BY mn.created_at DESC
        `, [studentId]);

        // Build full session history with details
        const sessionsWithDetails = sessionsResult.rows.map(s => ({
            id: s.id,
            status: s.status,
            startedAt: s.started_at,
            completedAt: s.completed_at,
            answerCount: parseInt(s.answer_count) || 0,
            avgTimePerQuestion: parseFloat(s.avg_time_ms) || 0,
            domainScores: s.domain_scores || {},
            patternClusters: s.pattern_clusters || [],
            riskFlags: s.risk_flags || {},
            overallRisk: s.overall_risk || 'not_assessed',
            hasResults: !!s.result_id
        }));

        res.json({
            student: {
                id: student.id,
                email: student.email,
                rollNo: student.roll_no,
                joinedAt: student.created_at,
                lastLogin: student.last_login,
                totalSessions: sessionsWithDetails.length
            },
            sessions: sessionsWithDetails,
            mentorNotes: notesResult.rows
        });
    } catch (err: any) {
        logger.error('Failed to get student details', err);
        res.status(500).json({ error: 'Failed to get student details' });
    }
});

/**
 * GET /api/mentor/student/:id/session/:sessionId
 * Get detailed data for a specific survey session
 */
router.get('/student/:id/session/:sessionId', authenticate, requireMentor, async (req: AuthRequest, res) => {
    try {
        const { id: studentId, sessionId } = req.params;

        // Verify session belongs to student
        const sessionResult = await pool.query(`
            SELECT 
                ss.id, ss.status, ss.started_at, ss.completed_at,
                ds.scores as domain_scores,
                pc.clusters as pattern_clusters,
                rf.flags as risk_flags, rf.overall_risk,
                sr.id as result_id
            FROM survey_sessions ss
            LEFT JOIN domain_scores ds ON ds.session_id = ss.id
            LEFT JOIN pattern_clusters pc ON pc.session_id = ss.id
            LEFT JOIN risk_flags rf ON rf.session_id = ss.id
            LEFT JOIN student_results sr ON sr.session_id = ss.id
            WHERE ss.id = $1 AND ss.user_id = $2
        `, [sessionId, studentId]);

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const session = sessionResult.rows[0];

        // Get all answers for this session
        const answersResult = await pool.query(
            'SELECT question_id, answer, created_at FROM answers WHERE session_id = $1 ORDER BY created_at',
            [sessionId]
        );

        // Get RAG context if exists
        let ragContext = null;
        if (session.result_id) {
            const ragResult = await pool.query(
                'SELECT * FROM rag_contexts WHERE student_result_id = $1 ORDER BY created_at DESC LIMIT 1',
                [session.result_id]
            );
            if (ragResult.rows.length > 0) {
                ragContext = {
                    reasoning: ragResult.rows[0].reasoning_output,
                    report: ragResult.rows[0].final_report,
                    createdAt: ragResult.rows[0].created_at
                };
            }
        }

        res.json({
            session: {
                id: session.id,
                status: session.status,
                startedAt: session.started_at,
                completedAt: session.completed_at,
                domainScores: session.domain_scores || {},
                patternClusters: session.pattern_clusters || [],
                riskFlags: session.risk_flags || {},
                overallRisk: session.overall_risk || 'not_assessed'
            },
            responses: answersResult.rows,
            ragAnalysis: ragContext
        });
    } catch (err: any) {
        logger.error('Failed to get session details', err);
        res.status(500).json({ error: 'Failed to get session details' });
    }
});

/**
 * POST /api/mentor/student/:id/regenerate-rag
 * Regenerate RAG analysis for a specific session
 */
router.post('/student/:id/regenerate-rag', authenticate, requireMentor, async (req: AuthRequest, res) => {
    try {
        const studentId = req.params.id;
        const { sessionId } = req.body;

        // Build query - if sessionId provided, use it; otherwise use latest
        let sessionQuery;
        let queryParams;

        if (sessionId) {
            sessionQuery = `
                SELECT ss.id, ds.scores, pc.clusters, rf.flags, rf.overall_risk, sr.id as result_id
                FROM survey_sessions ss
                JOIN domain_scores ds ON ds.session_id = ss.id
                JOIN pattern_clusters pc ON pc.session_id = ss.id
                JOIN risk_flags rf ON rf.session_id = ss.id
                JOIN student_results sr ON sr.session_id = ss.id
                WHERE ss.id = $1 AND ss.user_id = $2 AND ss.status = 'COMPLETED'
            `;
            queryParams = [sessionId, studentId];
        } else {
            sessionQuery = `
                SELECT ss.id, ds.scores, pc.clusters, rf.flags, rf.overall_risk, sr.id as result_id
                FROM survey_sessions ss
                JOIN domain_scores ds ON ds.session_id = ss.id
                JOIN pattern_clusters pc ON pc.session_id = ss.id
                JOIN risk_flags rf ON rf.session_id = ss.id
                JOIN student_results sr ON sr.session_id = ss.id
                WHERE ss.user_id = $1 AND ss.status = 'COMPLETED'
                ORDER BY ss.completed_at DESC
                LIMIT 1
            `;
            queryParams = [studentId];
        }

        const sessionResult = await pool.query(sessionQuery, queryParams);

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ error: 'No completed survey found for this session' });
        }

        const data: any = sessionResult.rows[0];

        // Build profile for RAG - handle patterns that might be strings or objects
        const rawPatterns = data.clusters || [];
        const normalizedPatterns = rawPatterns.map((p: any) => {
            if (typeof p === 'string') {
                return { name: p, confidence: 0.7, contributors: [] };
            }
            return { name: p.name || p, confidence: p.confidence || 0.7, contributors: p.contributors || [] };
        });

        const profile = {
            scores: data.scores || {},
            patterns: normalizedPatterns,
            risk: {
                overall_risk: data.overall_risk || 'moderate',
                flags: data.flags || {}
            }
        };

        // Generate new RAG output
        const ragOutput = await RagService.generateMentorReport(profile);

        // Store new RAG context (linked to this specific session's result)
        await pool.query(
            `INSERT INTO rag_contexts (student_result_id, reasoning_output, final_report, created_at)
             VALUES ($1, $2, $3, NOW())`,
            [data.result_id, JSON.stringify(ragOutput.explainability), JSON.stringify(ragOutput)]
        );

        logger.info(`RAG regenerated for student ${studentId}, session ${data.id}`);

        res.json({
            success: true,
            sessionId: data.id,
            ragAnalysis: ragOutput
        });
    } catch (err: any) {
        logger.error('Failed to regenerate RAG', err);
        res.status(500).json({ error: `Failed to regenerate analysis: ${err.message}` });
    }
});

/**
 * GET /api/mentor/notes/:studentId
 * Get mentor notes for a student
 */
router.get('/notes/:studentId', authenticate, requireMentor, async (req: AuthRequest, res) => {
    try {
        const { studentId } = req.params;

        const notes = await pool.query(`
            SELECT mn.*, u.email as mentor_email
            FROM mentor_notes mn
            JOIN mentors m ON mn.mentor_id = m.id
            JOIN users u ON m.user_id = u.id
            WHERE mn.student_id = $1
            ORDER BY mn.created_at DESC
        `, [studentId]);

        res.json(notes.rows);
    } catch (err: any) {
        logger.error('Failed to get mentor notes', err);
        res.status(500).json({ error: 'Failed to get notes' });
    }
});

/**
 * POST /api/mentor/notes
 * Add a mentor note
 */
router.post('/notes', authenticate, requireMentor, async (req: AuthRequest, res) => {
    try {
        const { studentId, content, isPrivate = true } = req.body;
        const mentorUserId = req.user!.id;

        if (!studentId || !content) {
            return res.status(400).json({ error: 'Student ID and content required' });
        }

        // Get or create mentor profile
        let mentorResult = await pool.query(
            'SELECT id FROM mentors WHERE user_id = $1',
            [mentorUserId]
        );

        let mentorId;
        if (mentorResult.rows.length === 0) {
            const newMentor = await pool.query(
                'INSERT INTO mentors (user_id) VALUES ($1) RETURNING id',
                [mentorUserId]
            );
            mentorId = newMentor.rows[0].id;
        } else {
            mentorId = mentorResult.rows[0].id;
        }

        // Insert note
        const noteResult = await pool.query(
            `INSERT INTO mentor_notes (mentor_id, student_id, content, is_private, created_at)
             VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
            [mentorId, studentId, content, isPrivate]
        );

        logger.info(`Mentor note added for student ${studentId}`);

        res.json(noteResult.rows[0]);
    } catch (err: any) {
        logger.error('Failed to add mentor note', err);
        res.status(500).json({ error: 'Failed to add note' });
    }
});

/**
 * DELETE /api/mentor/notes/:noteId
 * Delete a mentor note
 */
router.delete('/notes/:noteId', authenticate, requireMentor, async (req: AuthRequest, res) => {
    try {
        const { noteId } = req.params;
        const mentorUserId = req.user!.id;

        // Verify ownership
        const noteCheck = await pool.query(`
            SELECT mn.id FROM mentor_notes mn
            JOIN mentors m ON mn.mentor_id = m.id
            WHERE mn.id = $1 AND m.user_id = $2
        `, [noteId, mentorUserId]);

        if (noteCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Not authorized to delete this note' });
        }

        await pool.query('DELETE FROM mentor_notes WHERE id = $1', [noteId]);

        res.json({ success: true });
    } catch (err: any) {
        logger.error('Failed to delete mentor note', err);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

/**
 * POST /api/mentor/student/:id/chat
 * Chat with AI about a student
 */
router.post('/student/:id/chat', authenticate, requireMentor, async (req: AuthRequest, res) => {
    try {
        const studentId = req.params.id;
        const { message, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message required' });
        }

        // Get latest completed session (similar to regenerate logic)
        const sessionResult = await pool.query(`
            SELECT ss.id, ds.scores, pc.clusters, rf.flags, rf.overall_risk
            FROM survey_sessions ss
            JOIN domain_scores ds ON ds.session_id = ss.id
            JOIN pattern_clusters pc ON pc.session_id = ss.id
            JOIN risk_flags rf ON rf.session_id = ss.id
            WHERE ss.user_id = $1 AND ss.status = 'COMPLETED'
            ORDER BY ss.completed_at DESC
            LIMIT 1
        `, [studentId]);

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ error: 'No survey data available for this student' });
        }

        const data: any = sessionResult.rows[0];

        // Build profile
        const profile = {
            scores: data.scores,
            patterns: data.clusters || [],
            risk: {
                overall_risk: data.overall_risk,
                flags: data.flags || {}
            }
        };

        // Call RagService chat
        const result = await RagService.chatWithStudentData(profile, message, history);

        res.json(result);
    } catch (err: any) {
        logger.error('Failed to chat with AI', err);
        res.status(500).json({ error: 'Failed to process chat' });
    }
});

export default router;
