import { Router, Request, Response } from 'express';
// import { db } from '../config/database';
import { encrypt } from '../services/encryptionService';
import { scoreResponse } from '../services/riskScoring';
import { generateExplanation } from '../services/explainability';
import logger from '../utils/logger';
import { UserResponse } from '../models/types';

const router = Router();

// Submit a single response
router.post('/respond', async (req: Request, res: Response) => {
    const { sessionId, questionId, answer } = req.body;

    if (!sessionId || !questionId || !answer) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    try {
        // 1. Encrypt answer
        const encryptedAnswer = encrypt(answer);

        // 2. Save to DB (mocking)

        // For prototype, we just acknowledge receipt
        res.json({ status: 'saved' });

    } catch (err) {
        logger.error('Error saving response', err);
        res.status(500).json({ error: 'Failed to save response' });
    }
});

// Finalize and get results
router.post('/submit', async (req: Request, res: Response) => {
    const { sessionId, history } = req.body;

    if (!history || !Array.isArray(history)) {
        return res.status(400).json({ error: 'History required for scoring' });
    }

    try {
        const responses: UserResponse[] = history.map((h: any) => ({
            questionId: h.questionId,
            answer: h.answer,
            timestamp: new Date().toISOString() // Added timestamp for type compliance
        }));

        // 1. Calculate Risk
        const riskResult = scoreResponse(responses);

        // 2. Generate Explanation
        const explanation = generateExplanation(riskResult, responses);

        // 3. Save result to DB (encrypted)
        // const encryptedResult = encrypt(JSON.stringify(riskResult));

        res.json({
            riskLevel: riskResult.riskLevel,
            riskScore: riskResult.totalRiskScore,
            explanation,
            // maskedResponses: riskResult.maskedResponses
        });

    } catch (err) {
        logger.error('Error submitting survey', err);
        res.status(500).json({ error: 'Failed to process results' });
    }
});

export default router;
