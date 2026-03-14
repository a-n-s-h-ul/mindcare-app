-- Migration: 008_audio_analysis.sql

CREATE TABLE IF NOT EXISTS audio_mood_analysis (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES survey_sessions(id) ON DELETE CASCADE,
    question_id VARCHAR(50),
    transcript TEXT,
    predicted_mood VARCHAR(50),
    confidence_score VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audio_mood_session ON audio_mood_analysis(session_id);
