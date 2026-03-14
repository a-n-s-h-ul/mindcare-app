-- Migration: 007_update_vector_dimensions
-- Description: Updates vector dimensions to 768 (Gemini native)
-- Robust handling: Ensures all ivfflat indexes are dropped before dimension change

-- Drop ALL possible vector indexes that might exist from previous attempts or manual creation
DROP INDEX IF EXISTS idx_knowledge_chunks_embedding;
DROP INDEX IF EXISTS idx_retrieval_logs_query_embedding;
DROP INDEX IF EXISTS idx_embedding_cache_embedding;

-- Alter column dimensions to 768 (Native Gemini dimension)
-- This fits within the 2000 dimension limit for HNSW/IVFFlat on Render
ALTER TABLE knowledge_chunks ALTER COLUMN embedding TYPE vector(768);
ALTER TABLE retrieval_logs ALTER COLUMN query_embedding TYPE vector(768);
ALTER TABLE embedding_cache ALTER COLUMN embedding TYPE vector(768);

-- Recreate knowledge_chunks index using HNSW (supports up to 2000 dimensions)
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding 
ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);
