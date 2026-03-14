import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/pool';
import { selectNextQuestion } from '../services/adaptiveLogic';
import { authenticate, requireStudent, AuthRequest } from '../middleware/auth.middleware';
import { AnalysisService } from '../services/analysis.service';
import { RagService } from '../services/rag.service';
import { TrendService } from '../services/trend.service';
import logger from '../utils/logger';
import { questions } from '../models/questions';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client for audio processing
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Configure multer to store uploaded files in memory
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// ==========================================
// SURVEY ROUTES (Student Only)
// ==========================================

/**
 * POST /api/survey/start
 * Start a new survey session
 * Creates DB record, returns first question
 */
router.post('/start', authenticate, requireStudent, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;

        // Create survey session in DB
        const sessionResult = await pool.query(
            `INSERT INTO survey_sessions (user_id, status, started_at) 
             VALUES ($1, 'IN_PROGRESS', NOW()) 
             RETURNING id, started_at`,
            [userId]
        );

        const session = sessionResult.rows[0];
        const { nextQuestion } = selectNextQuestion([], []);

        logger.info(`Survey started: User ${userId}, Session ${session.id}`);

        res.json({
            sessionId: session.id,
            question: nextQuestion,
            startedAt: session.started_at
        });
    } catch (err: any) {
        logger.error('Failed to start survey', err);
        res.status(500).json({ error: 'Failed to start survey' });
    }
});

// ... (imports remain)
import { ReliabilityService } from '../services/reliability.service';

// ... (previous routes)

/**
 * POST /api/survey/respond
 * Save response and get next question
 */
router.post('/respond', authenticate, requireStudent, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { sessionId, questionId, answer, timeTaken, changeCount, focusLostCount } = req.body;

        if (!sessionId || !questionId || answer === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify session belongs to user
        const sessionCheck = await pool.query(
            `SELECT * FROM survey_sessions WHERE id = $1 AND user_id = $2 AND status = 'IN_PROGRESS'`,
            [sessionId, userId]
        );

        if (sessionCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Survey session not found or already completed' });
        }

        // Store answer in database
        await pool.query(
            `INSERT INTO answers (user_id, session_id, question_id, answer, created_at) 
             VALUES ($1, $2, $3, $4, NOW())`,
            [userId, sessionId, questionId, answer]
        );

        // Store Response Metadata (Phase A)
        if (timeTaken !== undefined) {
            await pool.query(
                `INSERT INTO response_metadata (user_id, session_id, question_id, time_taken_ms, change_count, focus_lost_count)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [userId, sessionId, questionId, timeTaken, changeCount || 0, focusLostCount || 0]
            );
        }

        // Update session question count
        await pool.query(
            `UPDATE survey_sessions SET total_questions = total_questions + 1 WHERE id = $1`,
            [sessionId]
        );

        // Get all responses for this session to determine next question
        const responsesResult = await pool.query(
            `SELECT question_id, answer FROM answers WHERE session_id = $1 ORDER BY created_at`,
            [sessionId]
        );

        const currentResponses = responsesResult.rows.map(r => ({
            questionId: r.question_id,
            answer: r.answer,
            timestamp: new Date().toISOString()
        }));

        const askedIds = currentResponses.map(r => r.questionId);

        // Determine next question
        const { nextQuestion, shouldStop, reason } = selectNextQuestion(currentResponses, askedIds);

        logger.info(`Response saved: Session ${sessionId}, Q: ${questionId}, A: ${answer}, Time: ${timeTaken}ms`);

        res.json({
            saved: true,
            nextQuestion,
            shouldStop,
            reason,
            progress: {
                answered: currentResponses.length,
                total: questions.length
            }
        });
    } catch (err: any) {
        logger.error('Failed to save response', err);
        res.status(500).json({ error: 'Failed to save response' });
    }
});

/**
 * POST /api/survey/audio
 * Upload a voice note, transcribe it, and predict mood using Gemini
 */
router.post('/audio', authenticate, requireStudent, upload.single('audio'), async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { sessionId, questionId } = req.body;
        const file = req.file;

        if (!sessionId || !file) {
            return res.status(400).json({ error: 'Session ID and audio file are required' });
        }

        // Verify session belongs to user
        const sessionCheck = await pool.query(
            `SELECT * FROM survey_sessions WHERE id = $1 AND user_id = $2 AND status = 'IN_PROGRESS'`,
            [sessionId, userId]
        );

        if (sessionCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Survey session not found or already completed' });
        }

        // Process audio with Gemini
        logger.info(`Processing audio for session ${sessionId}, size: ${file.size} bytes`);

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        You are a clinical AI assistant analyzing a voice recording from a student answering a mental health questionnaire.
        
        Please listen to this audio and provide:
        1. A transcript of what the student said.
        2. A predicted primary mood or emotional state based on their tone of voice, pacing, and words (e.g., Anxious, Depressed, Elevated, Calm, Stressed). Keep this to 1-2 words.
        3. A confidence score for your mood prediction (Low, Medium, High).
        
        Return ONLY a JSON object with this exact structure:
        {
          "transcript": "string",
          "predicted_mood": "string",
          "confidence": "string"
        }
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: file.mimetype || 'audio/webm',
                    data: file.buffer.toString("base64")
                }
            }
        ]);

        const responseText = result.response.text();

        // Output from Gemini usually contains markdown json blocks
        let analysis;
        try {
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            analysis = JSON.parse(cleanJson);
        } catch (e) {
            logger.error("Failed to parse Gemini audio analysis JSON", e);
            return res.status(500).json({ error: "Failed to parse audio analysis" });
        }

        // Store result in database
        await pool.query(
            `INSERT INTO audio_mood_analysis (session_id, question_id, transcript, predicted_mood, confidence_score) 
             VALUES ($1, $2, $3, $4, $5)`,
            [sessionId, questionId || null, analysis.transcript, analysis.predicted_mood, analysis.confidence]
        );

        logger.info(`Audio analysis complete for session ${sessionId}: Mood = ${analysis.predicted_mood}`);

        res.json({
            success: true,
            analysis: {
                transcript: analysis.transcript,
                mood: analysis.predicted_mood
            }
        });
    } catch (err: any) {
        logger.error('Failed to process audio', err);
        res.status(500).json({ error: 'Failed to process audio file' });
    }
});

/**
 * POST /api/survey/complete
 * Complete survey, trigger analysis and RAG
 */
router.post('/complete', authenticate, requireStudent, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { sessionId, contextTags } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID required' });
        }

        // Verify session
        const sessionCheck = await pool.query(
            `SELECT * FROM survey_sessions WHERE id = $1 AND user_id = $2 AND status = 'IN_PROGRESS'`,
            [sessionId, userId]
        );

        if (sessionCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Survey session not found or already completed' });
        }

        // Get all responses
        const responsesResult = await pool.query(
            `SELECT question_id, answer FROM answers WHERE session_id = $1`,
            [sessionId]
        );
        const responses = responsesResult.rows;

        // Get Response Metadata
        const metadataResult = await pool.query(
            `SELECT question_id as "questionId", time_taken_ms as "timeTaken", change_count as "changeCount"
             FROM response_metadata WHERE session_id = $1`,
            [sessionId]
        );
        const metadata = metadataResult.rows;

        if (responses.length === 0) {
            return res.status(400).json({ error: 'No responses found for this session' });
        }

        // Generate clinical profile
        const formattedResponses = responses.map(r => ({
            questionId: r.question_id,
            answer: r.answer,
            timestamp: new Date().toISOString()
        }));

        // Fetch any Audio Analysis tied to this session
        const audioResult = await pool.query(
            `SELECT transcript, predicted_mood, confidence_score 
             FROM audio_mood_analysis 
             WHERE session_id = $1
             ORDER BY created_at ASC`,
            [sessionId]
        );

        const audioContext = audioResult.rows.map(row => ({
            transcript: row.transcript,
            mood: row.predicted_mood,
            confidence: row.confidence_score
        }));

        const profile: any = AnalysisService.generateClinicalProfile(formattedResponses, audioContext);

        if (audioContext.length > 0) {
            profile.audioContext = audioContext;
        }

        // Store domain scores
        const domainScoresResult = await pool.query(
            `INSERT INTO domain_scores (user_id, session_id, scores, created_at)
             VALUES ($1, $2, $3, NOW()) RETURNING id`,
            [userId, sessionId, JSON.stringify(profile.scores)]
        );

        // Store pattern clusters
        const patternClustersResult = await pool.query(
            `INSERT INTO pattern_clusters (user_id, session_id, clusters, created_at)
             VALUES ($1, $2, $3, NOW()) RETURNING id`,
            [userId, sessionId, JSON.stringify(profile.patterns)]
        );

        // Store risk flags
        const riskFlagsResult = await pool.query(
            `INSERT INTO risk_flags (user_id, session_id, flags, overall_risk, created_at)
             VALUES ($1, $2, $3, $4, NOW()) RETURNING id`,
            [userId, sessionId, JSON.stringify(profile.risk.flags), profile.risk.overall_risk]
        );

        // Store student results
        const studentResultsResult = await pool.query(
            `INSERT INTO student_results (user_id, session_id, domain_scores_id, risk_flags_id, raw_responses, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`,
            [userId, sessionId, domainScoresResult.rows[0].id, riskFlagsResult.rows[0].id, JSON.stringify(responses)]
        );

        // --- RELIABILITY CALCULATION (Phase B) ---
        const reliability = ReliabilityService.calculateMetrics(formattedResponses, metadata);

        // Store Reliability Metrics
        await pool.query(
            `INSERT INTO reliability_metrics 
            (user_id, session_id, student_result_id, reliability_score, consistency_score, is_speed_running, interpretation_confidence)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                userId,
                sessionId,
                studentResultsResult.rows[0].id,
                reliability.score,
                reliability.consistencyScore,
                reliability.isSpeedRunning,
                reliability.confidence
            ]
        );

        // Store Submission Metadata (Context Tags)
        if (contextTags) {
            await pool.query(
                `INSERT INTO submission_metadata (session_id, context_tags) VALUES ($1, $2)`,
                [sessionId, contextTags]
            );
        }

        // Generate and store RAG context (async - don't block response)
        const ragPromise = (async () => {
            try {
                // Calculate Trends
                const trendAnalysis = await TrendService.analyzeTrends(userId, profile);

                // Pass reliability metrics AND trends to RAG
                const fullProfile = { ...profile, history: trendAnalysis };

                const ragOutput = await RagService.generateMentorReport(fullProfile, undefined, reliability);
                await pool.query(
                    `INSERT INTO rag_contexts (student_result_id, reasoning_output, final_report, created_at)
                     VALUES ($1, $2, $3, NOW())`,
                    [studentResultsResult.rows[0].id, JSON.stringify(ragOutput.explainability), JSON.stringify(ragOutput)]
                );
                logger.info(`RAG context generated for session ${sessionId}`);
            } catch (ragErr) {
                logger.error('RAG generation failed', ragErr);
            }
        })();

        // Mark session complete
        await pool.query(
            `UPDATE survey_sessions SET status = 'COMPLETED', completed_at = NOW() WHERE id = $1`,
            [sessionId]
        );

        logger.info(`Survey completed: User ${userId}, Session ${sessionId}, Reliability: ${reliability.confidence}`);

        // Return student-facing results (non-clinical)
        res.json({
            success: true,
            message: 'Survey completed successfully',
            sessionId,
            completedAt: new Date().toISOString(),
            summary: {
                questionsAnswered: responses.length,
                wellnessAreas: Object.keys(profile.scores).filter(k => (profile.scores as Record<string, number>)[k] > 50)
            }
        });

    } catch (err: any) {
        logger.error('Failed to complete survey', err);
        res.status(500).json({ error: 'Failed to complete survey' });
    }
});

/**
 * GET /api/survey/history
 * Get student's survey history
 */
router.get('/history', authenticate, requireStudent, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;

        const history = await pool.query(
            `SELECT ss.id, ss.status, ss.started_at, ss.completed_at, ss.total_questions,
                    ds.scores as domain_scores, rf.overall_risk
             FROM survey_sessions ss
             LEFT JOIN domain_scores ds ON ds.session_id = ss.id
             LEFT JOIN risk_flags rf ON rf.session_id = ss.id
             WHERE ss.user_id = $1
             ORDER BY ss.started_at DESC`,
            [userId]
        );

        res.json(history.rows);
    } catch (err: any) {
        logger.error('Failed to get survey history', err);
        res.status(500).json({ error: 'Failed to get survey history' });
    }
});

export default router;
