-- Migration: 002_mentor_system
-- Description: Adds tables for Mentor-Mediated RAG System

-- 1. ENUMS (if supported, otherwise CHECK constraints in tables)
-- Adding role to users. We'll use a CHECK constraint on the column for simplicity and portability.

-- 2. MODIFY USERS TABLE
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'admin'));

-- 3. MENTORS TABLE
CREATE TABLE IF NOT EXISTS mentors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentors_user_id ON mentors(user_id);

-- 4. DOMAIN SCORES (Calculated from survey)
CREATE TABLE IF NOT EXISTS domain_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    scores JSONB NOT NULL, -- { sleep: 45, anxiety: 60, ... }
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. PATTERN CLUSTERS (AI/Heuristic detected)
CREATE TABLE IF NOT EXISTS pattern_clusters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    clusters JSONB NOT NULL, -- [{ name: "Isolation", confidence: 0.9 }, ...]
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. RISK FLAGS
CREATE TABLE IF NOT EXISTS risk_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    flags JSONB NOT NULL, -- { suicide_risk: "MODERATE", depression: "HIGH" }
    overall_risk VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. STUDENT RESULTS (Aggregated View Storage)
CREATE TABLE IF NOT EXISTS student_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    domain_scores_id UUID REFERENCES domain_scores(id),
    risk_flags_id UUID REFERENCES risk_flags(id),
    raw_responses JSONB, -- Backup of exact Q&A
    created_at TIMESTAMP DEFAULT NOW()
);

-- 8. RAG CONTEXTS (The "Brain" of the Mentor Report)
CREATE TABLE IF NOT EXISTS rag_contexts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_result_id UUID REFERENCES student_results(id) ON DELETE CASCADE,
    retrieved_knowledge JSONB, -- What the RAG pulled from KB
    reasoning_output JSONB, -- The Chain-of-Thought
    final_report JSONB, -- The structured JSON for Frontend
    created_at TIMESTAMP DEFAULT NOW()
);

-- 9. MENTOR NOTES
CREATE TABLE IF NOT EXISTS mentor_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID REFERENCES mentors(id),
    student_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentor_notes_student ON mentor_notes(student_id);
