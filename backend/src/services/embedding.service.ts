/**
 * Embedding Service
 * Generates vector embeddings using Google Gemini API
 * Includes caching for performance optimization
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';
import pool from '../db/pool';

// Configuration
const EMBEDDING_MODEL = process.env.RAG_EMBEDDING_MODEL || 'text-embedding-004';
const EMBEDDING_DIMENSIONS = 3072; // Gemini embedding-001 dimension

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class EmbeddingService {
    /**
     * Generate embedding for a single text
     */
    static async generateEmbedding(text: string): Promise<number[]> {
        const contentHash = this.hashContent(text);

        // Check cache first
        const cached = await this.getCachedEmbedding(contentHash);
        if (cached) {
            console.log(`[EMBEDDING] Cache hit for hash: ${contentHash.substring(0, 8)}...`);
            return cached;
        }

        // Generate new embedding using Gemini
        console.log(`[EMBEDDING] Generating embedding for: "${text.substring(0, 50)}..."`);

        const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
        const result = await model.embedContent(text);

        let embedding = result.embedding.values;

        // Ensure embedding is the right dimension (pad or truncate if needed)
        if (embedding.length < EMBEDDING_DIMENSIONS) {
            // Pad with zeros if shorter
            embedding = [...embedding, ...new Array(EMBEDDING_DIMENSIONS - embedding.length).fill(0)];
        } else if (embedding.length > EMBEDDING_DIMENSIONS) {
            // Truncate if longer
            embedding = embedding.slice(0, EMBEDDING_DIMENSIONS);
        }

        // Cache the result
        await this.cacheEmbedding(contentHash, embedding);

        return embedding;
    }

    /**
     * Generate embeddings for multiple texts (batch)
     */
    static async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
        console.log(`[EMBEDDING] Batch generating ${texts.length} embeddings`);

        const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });

        // Gemini batch embedding
        const result = await model.batchEmbedContents({
            requests: texts.map(text => ({
                content: { role: 'user', parts: [{ text }] }
            }))
        });

        return result.embeddings.map(e => {
            let embedding = e.values;
            // Ensure correct dimension
            if (embedding.length < EMBEDDING_DIMENSIONS) {
                embedding = [...embedding, ...new Array(EMBEDDING_DIMENSIONS - embedding.length).fill(0)];
            } else if (embedding.length > EMBEDDING_DIMENSIONS) {
                embedding = embedding.slice(0, EMBEDDING_DIMENSIONS);
            }
            return embedding;
        });
    }

    /**
     * Generate query embedding (for retrieval)
     * Constructs semantic query from structured student state
     */
    static async generateQueryEmbedding(queryContext: {
        domainScores: Record<string, number>;
        patterns: string[];
        riskLevel: string;
        mentorIntent?: string;
    }): Promise<number[]> {
        // Build semantic query from structured data
        const queryParts: string[] = [];

        // Add high-scoring domains
        const highDomains = Object.entries(queryContext.domainScores)
            .filter(([_, score]: any) => score > 50)
            .sort((a: any, b: any) => b[1] - a[1])
            .slice(0, 3);

        if (highDomains.length > 0) {
            queryParts.push(`Student showing elevated ${highDomains.map((d: any) => d[0]).join(', ')} indicators`);
        }

        // Add patterns
        if (queryContext.patterns.length > 0) {
            queryParts.push(`Detected patterns: ${queryContext.patterns.join(', ')}`);
        }

        // Add risk context
        queryParts.push(`Risk level: ${queryContext.riskLevel}`);

        // Add mentor intent if specified
        if (queryContext.mentorIntent) {
            queryParts.push(`Mentor seeking: ${queryContext.mentorIntent}`);
        }

        const semanticQuery = queryParts.join('. ');

        console.log(`[EMBEDDING] Query constructed: "${semanticQuery}"`);

        // Generate real embedding for the query
        return this.generateEmbedding(semanticQuery);
    }

    /**
     * Hash content for cache key
     */
    private static hashContent(content: string): string {
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    /**
     * Get cached embedding
     */
    private static async getCachedEmbedding(contentHash: string): Promise<number[] | null> {
        try {
            const result = await pool.query(
                `SELECT embedding FROM embedding_cache WHERE content_hash = $1`,
                [contentHash]
            );

            if (result.rows.length > 0) {
                // Update access stats
                await pool.query(
                    `UPDATE embedding_cache SET last_accessed = NOW(), access_count = access_count + 1 WHERE content_hash = $1`,
                    [contentHash]
                );

                // Parse the vector string to array
                const vectorStr = result.rows[0].embedding;
                return this.parseVectorString(vectorStr);
            }
            return null;
        } catch (error) {
            console.error('[EMBEDDING] Cache lookup failed:', error);
            return null;
        }
    }

    /**
     * Cache embedding
     */
    private static async cacheEmbedding(contentHash: string, embedding: number[]): Promise<void> {
        try {
            await pool.query(
                `INSERT INTO embedding_cache (content_hash, embedding) 
                 VALUES ($1, $2) 
                 ON CONFLICT (content_hash) DO UPDATE SET last_accessed = NOW()`,
                [contentHash, `[${embedding.join(',')}]`]
            );
        } catch (error) {
            console.error('[EMBEDDING] Cache write failed:', error);
        }
    }

    /**
     * Parse PostgreSQL vector string to number array
     */
    private static parseVectorString(vectorStr: string): number[] {
        // pgvector returns '[1,2,3]' format
        const cleaned = vectorStr.replace(/[\[\]]/g, '');
        return cleaned.split(',').map(Number);
    }

    /**
     * Clear expired cache entries (utility)
     */
    static async cleanupCache(maxAgeDays: number = 30): Promise<number> {
        const result = await pool.query(
            `DELETE FROM embedding_cache WHERE last_accessed < NOW() - INTERVAL '${maxAgeDays} days' RETURNING id`
        );
        console.log(`[EMBEDDING] Cleaned up ${result.rowCount} expired cache entries`);
        return result.rowCount || 0;
    }
}
