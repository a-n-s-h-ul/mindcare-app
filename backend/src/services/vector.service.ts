/**
 * Vector Service
 * Handles pgvector similarity search and context retrieval
 */

import pool from '../db/pool';
import { EmbeddingService } from './embedding.service';

export interface RetrievedChunk {
    id: string;
    content: string;
    chunkType: string;
    sourceDocument: string;
    sourceSection: string;
    similarity: number;
    metadata: Record<string, any>;
}

export interface RetrievalQuery {
    domainScores: Record<string, number>;
    patterns: string[];
    riskLevel: string;
    mentorIntent?: string;
    chunkTypes?: string[];
    topK?: number;
    similarityThreshold?: number;
}

export class VectorService {
    private static DEFAULT_TOP_K = parseInt(process.env.RAG_TOP_K || '10');
    private static DEFAULT_SIMILARITY_THRESHOLD = parseFloat(process.env.RAG_SIMILARITY_THRESHOLD || '0.7');

    /**
     * Search for similar knowledge chunks
     */
    static async search(query: RetrievalQuery): Promise<RetrievedChunk[]> {
        const topK = query.topK || this.DEFAULT_TOP_K;
        const threshold = query.similarityThreshold || this.DEFAULT_SIMILARITY_THRESHOLD;

        try {
            const queryEmbedding = await EmbeddingService.generateQueryEmbedding({
                domainScores: query.domainScores,
                patterns: query.patterns,
                riskLevel: query.riskLevel,
                mentorIntent: query.mentorIntent
            });

            let sql = `
                SELECT 
                    id,
                    content,
                    chunk_type,
                    source_document,
                    source_section,
                    metadata,
                    1 - (embedding <=> $1::vector) as similarity
                FROM knowledge_chunks
                WHERE 1 - (embedding <=> $1::vector) >= $2
            `;
            const params: any[] = [`[${queryEmbedding.join(',')}]`, threshold];

            if (query.chunkTypes && query.chunkTypes.length > 0) {
                sql += ` AND chunk_type = ANY($3)`;
                params.push(query.chunkTypes);
            }

            sql += ` ORDER BY similarity DESC LIMIT $${params.length + 1}`;
            params.push(topK);

            console.log(`[VECTOR] Searching for ${topK} chunks with threshold ${threshold}`);
            const result = await pool.query(sql, params);

            return result.rows.map((row: any) => ({
                id: row.id,
                content: row.content,
                chunkType: row.chunk_type,
                sourceDocument: row.source_document,
                sourceSection: row.source_section,
                similarity: row.similarity,
                metadata: row.metadata
            }));
        } catch (err: any) {
            console.warn(`[VECTOR] Search failed (pgvector may not be installed): ${err.message}`);
            console.warn('[VECTOR] Falling back to LLM-only mode (no knowledge retrieval)');
            return [];
        }
    }

    /**
     * Multi-stage retrieval with re-ranking
     */
    static async retrieveWithRanking(query: RetrievalQuery): Promise<RetrievedChunk[]> {
        try {
            const initialResults = await this.search({
                ...query,
                topK: (query.topK || this.DEFAULT_TOP_K) * 2,
                similarityThreshold: 0.5
            });

            const rankedResults = this.rankByRelevance(initialResults, query);
            const filtered = this.filterResults(rankedResults, query);
            return filtered.slice(0, query.topK || this.DEFAULT_TOP_K);
        } catch (err: any) {
            console.warn(`[VECTOR] retrieveWithRanking failed: ${err.message}`);
            return [];
        }
    }

    /**
     * Rank results by relevance to query context
     */
    private static rankByRelevance(chunks: RetrievedChunk[], query: RetrievalQuery): RetrievedChunk[] {
        return chunks.map(chunk => {
            let boostScore = chunk.similarity;

            // Boost based on chunk type matching query needs
            if (query.riskLevel === 'high' || query.riskLevel === 'critical') {
                if (chunk.chunkType === 'safety' || chunk.chunkType === 'protocol') {
                    boostScore *= 1.3;
                }
            }

            // Boost intervention chunks when patterns suggest need
            if (query.patterns.length > 0 && chunk.chunkType === 'intervention') {
                boostScore *= 1.2;
            }

            // Boost clinical chunks for complex cases
            const highDomainCount = Object.values(query.domainScores).filter(s => s > 60).length;
            if (highDomainCount >= 3 && chunk.chunkType === 'clinical') {
                boostScore *= 1.2;
            }

            return {
                ...chunk,
                similarity: Math.min(boostScore, 1) // Cap at 1.0
            };
        }).sort((a: any, b: any) => b.similarity - a.similarity);
    }

    /**
     * Filter results for quality and diversity
     */
    private static filterResults(chunks: RetrievedChunk[], query: RetrievalQuery): RetrievedChunk[] {
        const seen = new Set<string>();
        const typeCount: Record<string, number> = {};
        const maxPerType = 3;

        return chunks.filter((chunk: any) => {
            // Deduplicate by content similarity
            const contentKey = chunk.content.substring(0, 100);
            if (seen.has(contentKey)) return false;
            seen.add(contentKey);

            // Ensure diversity of chunk types
            typeCount[chunk.chunkType] = (typeCount[chunk.chunkType] || 0) + 1;
            if (typeCount[chunk.chunkType] > maxPerType) return false;

            // Apply final threshold
            if (chunk.similarity < (query.similarityThreshold || this.DEFAULT_SIMILARITY_THRESHOLD)) {
                return false;
            }

            return true;
        });
    }

    /**
     * Log retrieval for explainability
     */
    static async logRetrieval(
        studentId: string | null,
        mentorId: string | null,
        queryContext: any,
        chunks: RetrievedChunk[],
        llmOutput: any,
        processingTimeMs: number
    ): Promise<string> {
        const result = await pool.query(
            `INSERT INTO retrieval_logs 
             (student_id, mentor_id, query_context, retrieved_chunk_ids, similarity_scores, llm_output, processing_time_ms)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [
                studentId,
                mentorId,
                queryContext,
                chunks.map(c => c.id),
                chunks.map(c => c.similarity),
                llmOutput,
                processingTimeMs
            ]
        );
        return result.rows[0].id;
    }
}
