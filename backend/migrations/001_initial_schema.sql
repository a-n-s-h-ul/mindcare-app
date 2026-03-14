
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL,
    risk_score JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS responses (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(id),
    question_id VARCHAR(10) NOT NULL,
    answer_encrypted TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_responses_session ON responses(session_id);
