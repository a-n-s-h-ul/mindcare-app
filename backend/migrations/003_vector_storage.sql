-- Migration: 003_vector_storage
-- Description: Adds pgvector extension and knowledge storage for RAG system

-- 1. ENABLE PGVECTOR EXTENSION
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. KNOWLEDGE CHUNKS TABLE
-- Stores embedded document chunks for retrieval
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Content
    content TEXT NOT NULL,
    content_hash VARCHAR(64) UNIQUE, -- SHA256 for deduplication
    
    -- Embedding (1536 dimensions for text-embedding-3-small)
    embedding vector(1536),
    
    -- Metadata
    chunk_type VARCHAR(50) NOT NULL, -- 'clinical', 'institutional', 'intervention', 'safety', 'protocol'
    source_document VARCHAR(255),
    source_section VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    
    -- Tracking
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. INDEXES FOR VECTOR SEARCH
-- IVFFlat index for approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding 
ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Index for chunk type filtering
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_type ON knowledge_chunks(chunk_type);

-- 4. RETRIEVAL LOGS TABLE
-- For explainability and audit trail
CREATE TABLE IF NOT EXISTS retrieval_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Request Context
    student_id UUID REFERENCES users(id),
    mentor_id UUID,
    session_id UUID,
    
    -- Query
    query_embedding vector(1536),
    query_context JSONB, -- domain_scores, patterns, risk_flags
    
    -- Results
    retrieved_chunk_ids UUID[],
    similarity_scores FLOAT[],
    
    -- LLM Output
    llm_input JSONB,
    llm_output JSONB,
    
    -- Metadata
    model_used VARCHAR(50),
    processing_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. EMBEDDING CACHE TABLE
-- For caching frequently used embeddings
CREATE TABLE IF NOT EXISTS embedding_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_hash VARCHAR(64) UNIQUE,
    embedding vector(1536),
    created_at TIMESTAMP DEFAULT NOW(),
    last_accessed TIMESTAMP DEFAULT NOW(),
    access_count INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_embedding_cache_hash ON embedding_cache(content_hash);
