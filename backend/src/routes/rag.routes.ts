/**
 * RAG Routes
 * Endpoints for knowledge ingestion and RAG querying
 */

import express from 'express';
import { IngestionService, DocumentChunk } from '../services/ingestion.service';
import { VectorService } from '../services/vector.service';
import { RagService } from '../services/rag.service';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Middleware to require admin role for ingestion
const requireAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
};

/**
 * POST /api/rag/ingest
 * Ingest a document into the knowledge base
 */
router.post('/ingest', authenticate, requireAdmin, async (req, res) => {
    try {
        const { content, chunkType, sourceDocument, options } = req.body;

        if (!content || !chunkType || !sourceDocument) {
            return res.status(400).json({
                error: 'Missing required fields: content, chunkType, sourceDocument'
            });
        }

        const result = await IngestionService.ingestDocument(
            content,
            chunkType,
            sourceDocument,
            options || {}
        );

        res.json({
            success: true,
            ...result
        });
    } catch (error: any) {
        console.error('[RAG] Ingestion error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/rag/ingest/batch
 * Batch ingest multiple knowledge chunks
 */
router.post('/ingest/batch', authenticate, requireAdmin, async (req, res) => {
    try {
        const { chunks } = req.body;

        if (!chunks || !Array.isArray(chunks)) {
            return res.status(400).json({ error: 'chunks array required' });
        }

        const result = await IngestionService.ingestBatch(chunks as DocumentChunk[]);

        res.json({
            success: true,
            ...result
        });
    } catch (error: any) {
        console.error('[RAG] Batch ingestion error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/rag/query
 * Query the RAG system (for testing/debugging)
 */
router.post('/query', authenticate, async (req: any, res) => {
    try {
        const { domainScores, patterns, riskLevel, mentorIntent, topK } = req.body;

        const chunks = await VectorService.retrieveWithRanking({
            domainScores: domainScores || {},
            patterns: patterns || [],
            riskLevel: riskLevel || 'moderate',
            mentorIntent,
            topK
        });

        res.json({
            success: true,
            count: chunks.length,
            chunks: chunks.map(c => ({
                id: c.id,
                chunkType: c.chunkType,
                sourceDocument: c.sourceDocument,
                similarity: Math.round(c.similarity * 1000) / 1000,
                excerpt: c.content.substring(0, 200) + '...'
            }))
        });
    } catch (error: any) {
        console.error('[RAG] Query error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/rag/stats
 * Get knowledge base statistics
 */
router.get('/stats', authenticate, async (req, res) => {
    try {
        const stats = await IngestionService.getStats();
        res.json({ success: true, stats });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/rag/generate
 * Generate a full RAG report (for testing)
 */
router.post('/generate', authenticate, async (req: any, res) => {
    try {
        const { studentProfile, mentorIntent } = req.body;

        if (!studentProfile) {
            return res.status(400).json({ error: 'studentProfile required' });
        }

        const report = await RagService.generateMentorReport(studentProfile, mentorIntent);

        res.json({
            success: true,
            report
        });
    } catch (error: any) {
        console.error('[RAG] Generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
