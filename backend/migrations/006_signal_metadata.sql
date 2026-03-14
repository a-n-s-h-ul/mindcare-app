-- Migration: 006_signal_metadata
-- Description: Adds tables for structured behavioral signals, response timing, and reliability metrics

-- 1. RESPONSE METADATA
-- Captures behavioral data PER QUESTION (granular)
CREATE TABLE IF NOT EXISTS response_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES survey_sessions(id) ON DELETE CASCADE,
    question_id VARCHAR(20) NOT NULL,
    
    -- Telemetry
    time_taken_ms INTEGER, -- Time spent on this specific question
    change_count INTEGER DEFAULT 0, -- How many times they changed the answer before submitting
    focus_lost_count INTEGER DEFAULT 0, -- How many times they tabbed away
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for rapid retrieval during analysis
CREATE INDEX IF NOT EXISTS idx_response_metadata_session ON response_metadata(session_id);


-- 2. RELIABILITY METRICS
-- Captures high-level confidence scores PER SESSION
CREATE TABLE IF NOT EXISTS reliability_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES survey_sessions(id) ON DELETE CASCADE,
    student_result_id UUID REFERENCES student_results(id) ON DELETE CASCADE,
    
    -- Calculated Scores (0.00 to 1.00)
    reliability_score NUMERIC(5,2) NOT NULL, -- Overall data quality confidence
    consistency_score NUMERIC(5,2) NOT NULL, -- Internal consistency (contradiction check)
    
    -- Component Signals
    is_speed_running BOOLEAN DEFAULT FALSE, -- Too fast to read?
    has_pattern_instability BOOLEAN DEFAULT FALSE, -- Wildly different from baseline?
    
    -- Metadata
    interpretation_confidence VARCHAR(20) DEFAULT 'HIGH', -- HIGH, MEDIUM, CAUTION
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reliability_metrics_session ON reliability_metrics(session_id);


-- 3. SUBMISSION METADATA
-- Captures contextual tags for the whole session
CREATE TABLE IF NOT EXISTS submission_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES survey_sessions(id) ON DELETE CASCADE,
    
    -- Context Tags (Array of strings)
    -- e.g., ['exam_period', 'late_night', 'assignment_heavy']
    context_tags TEXT[],
    
    -- Device/Env info
    user_agent TEXT,
    platform VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT NOW()
);
