-- Migration: 007_update_vector_dimensions
-- Description: Updates vector dimensions from 1536 to 3072 for gemini-embedding-001
-- Robust handling: Ensures all ivfflat indexes are dropped before dimension change

-- Drop ALL possible vector indexes that might exist from previous attempts or manual creation
DROP INDEX IF EXISTS idx_knowledge_chunks_embedding;
DROP INDEX IF EXISTS idx_retrieval_logs_query_embedding;
DROP INDEX IF EXISTS idx_embedding_cache_embedding;

-- Alter column dimensions
-- Note: This will fail if there are any remaining indexes on these columns
ALTER TABLE knowledge_chunks ALTER COLUMN embedding TYPE vector(3072);
ALTER TABLE retrieval_logs ALTER COLUMN query_embedding TYPE vector(3072);
ALTER TABLE embedding_cache ALTER COLUMN embedding TYPE vector(3072);

-- Recreate knowledge_chunks index using HNSW (supports > 2000 dimensions)
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding 
ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);
