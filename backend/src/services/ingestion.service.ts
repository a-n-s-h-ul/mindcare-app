/**
 * Ingestion Service
 * Handles document chunking and knowledge base ingestion
 */

import crypto from 'crypto';
import pool from '../db/pool';
import { EmbeddingService } from './embedding.service';

export interface DocumentChunk {
    content: string;
    chunkType: string;
    sourceDocument: string;
    sourceSection: string;
    metadata?: Record<string, any>;
}

export interface IngestOptions {
    chunkSize?: number;
    chunkOverlap?: number;
    skipDuplicates?: boolean;
}

export class IngestionService {
    private static DEFAULT_CHUNK_SIZE = 512; // tokens (approx)
    private static DEFAULT_CHUNK_OVERLAP = 50;

    /**
     * Ingest a document with chunking
     */
    static async ingestDocument(
        content: string,
        chunkType: string,
        sourceDocument: string,
        options: IngestOptions = {}
    ): Promise<{ chunksCreated: number; chunksSkipped: number }> {
        const chunks = this.chunkDocument(content, {
            chunkSize: options.chunkSize || this.DEFAULT_CHUNK_SIZE,
            overlap: options.chunkOverlap || this.DEFAULT_CHUNK_OVERLAP
        });

        console.log(`[INGESTION] Processing ${chunks.length} chunks from ${sourceDocument}`);

        let created = 0;
        let skipped = 0;

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const sectionLabel = `Section ${i + 1}/${chunks.length}`;

            try {
                const result = await this.ingestChunk({
                    content: chunk,
                    chunkType,
                    sourceDocument,
                    sourceSection: sectionLabel,
                    metadata: { chunkIndex: i, totalChunks: chunks.length }
                }, options.skipDuplicates !== false);

                if (result) created++;
                else skipped++;
            } catch (error) {
                console.error(`[INGESTION] Failed to ingest chunk ${i}:`, error);
                skipped++;
            }
        }

        console.log(`[INGESTION] Complete: ${created} created, ${skipped} skipped`);
        return { chunksCreated: created, chunksSkipped: skipped };
    }

    /**
     * Ingest a single pre-chunked document
     */
    static async ingestChunk(chunk: DocumentChunk, skipDuplicates: boolean = true): Promise<boolean> {
        const contentHash = crypto.createHash('sha256').update(chunk.content).digest('hex');

        // Check for duplicates
        if (skipDuplicates) {
            const existing = await pool.query(
                'SELECT id FROM knowledge_chunks WHERE content_hash = $1',
                [contentHash]
            );
            if (existing.rows.length > 0) {
                console.log(`[INGESTION] Skipping duplicate chunk`);
                return false;
            }
        }

        // Generate embedding
        const embedding = await EmbeddingService.generateEmbedding(chunk.content);

        // Insert into database
        await pool.query(
            `INSERT INTO knowledge_chunks 
             (content, content_hash, embedding, chunk_type, source_document, source_section, metadata)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (content_hash) DO NOTHING`,
            [
                chunk.content,
                contentHash,
                `[${embedding.join(',')}]`,
                chunk.chunkType,
                chunk.sourceDocument,
                chunk.sourceSection,
                chunk.metadata || {}
            ]
        );

        return true;
    }

    /**
     * Ingest multiple pre-defined knowledge items
     */
    static async ingestBatch(chunks: DocumentChunk[]): Promise<{ chunksCreated: number; chunksSkipped: number }> {
        let created = 0;
        let skipped = 0;

        for (const chunk of chunks) {
            const result = await this.ingestChunk(chunk, true);
            if (result) created++;
            else skipped++;
        }

        return { chunksCreated: created, chunksSkipped: skipped };
    }

    /**
     * Chunk document into smaller pieces
     */
    private static chunkDocument(content: string, options: { chunkSize: number; overlap: number }): string[] {
        const words = content.split(/\s+/);
        const chunks: string[] = [];

        const wordsPerChunk = Math.floor(options.chunkSize * 0.75); // Approximate tokens to words
        const overlapWords = Math.floor(options.overlap * 0.75);

        for (let i = 0; i < words.length; i += wordsPerChunk - overlapWords) {
            const chunkWords = words.slice(i, i + wordsPerChunk);
            if (chunkWords.length > 20) { // Minimum chunk size
                chunks.push(chunkWords.join(' '));
            }
        }

        return chunks;
    }

    /**
     * Get stats about ingested knowledge
     */
    static async getStats(): Promise<Record<string, number>> {
        const result = await pool.query(
            `SELECT chunk_type, COUNT(*) as count FROM knowledge_chunks GROUP BY chunk_type`
        );

        const stats: Record<string, number> = {};
        result.rows.forEach(row => {
            stats[row.chunk_type] = parseInt(row.count);
        });

        return stats;
    }

    /**
     * Clear all knowledge (for testing)
     */
    static async clearAll(): Promise<number> {
        const result = await pool.query('DELETE FROM knowledge_chunks RETURNING id');
        return result.rowCount || 0;
    }
}
