-- Migration: 007_update_vector_dimensions
-- Description: Updates vector dimensions from 1536 to 3072 for gemini-embedding-001

-- Drop existing indexes
DROP INDEX IF EXISTS idx_knowledge_chunks_embedding;

-- Alter column dimensions
ALTER TABLE knowledge_chunks ALTER COLUMN embedding TYPE vector(3072);
ALTER TABLE retrieval_logs ALTER COLUMN query_embedding TYPE vector(3072);
ALTER TABLE embedding_cache ALTER COLUMN embedding TYPE vector(3072);

-- Recreate index
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding 
ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
