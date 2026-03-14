-- Migration: 005_fix_session_references
-- Description: Drops foreign key constraints that reference old sessions table
-- and allows session_id to reference survey_sessions instead

-- Drop foreign key constraints on session_id columns
ALTER TABLE domain_scores DROP CONSTRAINT IF EXISTS domain_scores_session_id_fkey;
ALTER TABLE pattern_clusters DROP CONSTRAINT IF EXISTS pattern_clusters_session_id_fkey;
ALTER TABLE risk_flags DROP CONSTRAINT IF EXISTS risk_flags_session_id_fkey;
ALTER TABLE student_results DROP CONSTRAINT IF EXISTS student_results_session_id_fkey;

-- The session_id now refers to survey_sessions.id (UUID) without FK constraint
-- This allows flexibility during the migration period
