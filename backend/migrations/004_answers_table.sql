-- Migration: 004_answers_table
-- Description: Adds answers table for persistent survey response storage

-- 1. ANSWERS TABLE
-- Stores individual survey responses per question
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID,
    question_id VARCHAR(20) NOT NULL,
    answer INTEGER NOT NULL,
    answer_text TEXT, -- Optional text for open-ended questions
    survey_version VARCHAR(20) DEFAULT '1.0',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_answers_user ON answers(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_session ON answers(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_created ON answers(created_at);

-- 2. SURVEY SESSIONS TABLE (replaces in-memory storage)
CREATE TABLE IF NOT EXISTS survey_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
    survey_version VARCHAR(20) DEFAULT '1.0',
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    total_questions INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_survey_sessions_user ON survey_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_sessions_status ON survey_sessions(status);
