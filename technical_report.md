# AI-Assisted Student Wellbeing Platform
## Technical Implementation Report

**Date:** February 11, 2026
**Version:** 1.0
**Status:** Alpha / Pilot Ready

---

## 1. Executive Summary

This document details the technical implementation of a production-grade AI-assisted student wellbeing platform designed to identify at-risk students through valid psychological surveys and provide actionable, AI-synthesized insights to human mentors.

The system addresses the challenge of scaling mental health support by moving beyond simple scoring to **reasoned analysis**. Unlike standard survey tools, this platform incorporates a **Reliability Layer** to detect rushed or contradictory responses and a **RAG (Retrieval-Augmented Generation) Engine** that contextualizes student data against clinical and institutional protocols before generating insights.

**Current Implementation Status:**
The core infrastructure, including the full survey flow, complex scoring engine, RAG reasoning pipeline, reliability heuristics, and mentor dashboard, is functionally complete and integrated.

---

## 2. System Overview

The platform operates as a closed-loop system with three primary actors:

1.  **Student System:** A secure, distraction-free environment for taking psychological assessments (survey).
2.  **Scoring & Reliability Engine:** A background processing layer that computes raw scores, detects behavioral anomalies (e.g., speed-running), and assesses validitity.
3.  **Mentor Dashboard:** A decision-support interface where faculty/mentors review prioritized cases. Mentors do **not** see raw scores alone; they see AI-synthesized narratives calibrated by data confidence.

**Key Interaction Flow:**
`Student` → `Survey` → `Scoring + Reliability Analysis` → `AI Reasoning (RAG)` → `Mentor Review` → `Intervention`

---

## 3. Technical Architecture

The system follows a modern service-oriented architecture:

### 3.1 Frontend (Client)
*   **Framework:** Next.js 14 (React)
*   **Styling:** Tailwind CSS + Framer Motion (for calm, fluid UI)
*   **Safety:** JWT-based authentication, "Progressive Disclosure" UI design to prevent information overload for mentors.

### 3.2 Backend (Server)
*   **Runtime:** Node.js / Express (TypeScript)
*   **AI Orchestration:** Google Gemini 2.0 Flash via standard REST API
*   **Vector Search:** `pgvector` for similarity search
*   **Architecture:** Controller-Service-Repository pattern

### 3.3 Database (Persistence)
*   **Core DB:** PostgreSQL 15+
*   **Vector Extension:** `pgvector` enabled for 1536-dimensional embeddings
*   **Identity:** Custom RBAC (Student/Mentor/Admin) linked to Google Auth

---

## 4. Detailed Data Flow

The data pipeline transforms raw clicks into clinical insights through seven distinct stages:

1.  **Ingest:** Student submits answer. Platform captures answer value (0-3), time taken (ms), and behavioral signals (focus loss).
    *   *Storage:* `answers` table, `response_metadata` table.
2.  **Scoring (Deterministic):**
    *   **Domain Mapping:** Answers mapped to domains (Sleep, Anhedonia, Isolation).
    *   **Composite Risk:** Weighted calculation of higher-order risks (Depression, Anxiety, Burnout).
    *   *Service:* `riskScoring.ts`.
3.  **Reliability Check (Heuristic):**
    *   **Speed Analysis:** flags sessions where >30% of questions were answered in <1.5s.
    *   **Consistency Check:** detects logical contradictions (e.g., claiming "High Energy" but "Cannot get out of bed").
    *   *Service:* `reliability.service.ts`.
4.  **Context Assembly:**
    *   System constructs a structured "Student Profile" containing scores, detected risk flags (e.g., "Suicide Triad"), and reliability metrics.
5.  **Retrieval (RAG):**
    *   System embeds the Student Profile to query the `knowledge_chunks` database.
    *   Retrieves clinical protocols, institutional guidelines, and safety definitions relevant to the student's specific risk pattern.
6.  **Reasoning (Generative):**
    *   Gemini 2.0 receives: `Student Profile` + `Reliability Warnings` + `Retrieved Protocols`.
    *   Generates a **Structured JSON Report** (not free text) containing dominant patterns, risk assessment, and conversation guides.
7.  **Presentation:**
    *   Mentor Dashboard renders the "Focus Queue" based on urgency.
    *   Student details are shown with "Data Confidence" badges derived from the Reliability layer.

---

## 5. RAG System Explanation

We use **Retrieval-Augmented Generation (RAG)** to ground AI insights in established protocols, preventing hallucination and ensuring institutional alignment.

*   **Embeddings:** Text is embedded using small, high-performance models (1536 dims).
*   **Knowledge Base:** Stored in `knowledge_chunks` table, categorized by type:
    *   `clinical`: Symptom definitions and standard thresholds.
    *   `institutional`: University specific referral pathways.
    *   `intervention`: Battle-tested conversation starters and safety plans.
*   **Context Construction:** The prompt to the LLM explicitly separates "evidence" (scores) from "knowledge" (retrieved chunks).
*   **Structured Output:** The LLM is forced to output strict JSON. This ensures the frontend can reliably render "Risk Indicators", "Conversation Starters", and "Reasoning Summaries" as distinct UI elements.

**Why RAG?**
It allows the system to say *"Based on University Protocol 7A, this student requires immediate counseling"* rather than a generic *"You should help them."*

---

## 6. Reliability & Confidence System

A unique feature of this architecture is the **Reliability Service**, which acts as a "Trust Layer" before AI processing.

*   **Speed Running Detection:**
    *   Threshold: < 1.5 seconds per question.
    *   Logic: If >30% of questions are speed-run, the session is flagged as "Low Reliability".
*   **Internal Consistency:**
    *   The system checks specific question pairs for contradictions.
    *   *Example:* Q1 (Sleep hours) vs Q25 (Early waking).
    *   *Example:* Q30 (Enjoyment) vs Q32 (Life Satisfaction).
*   **Impact on AI:** 
    *   If Reliability is LOW, the AI prompt is injected with: `WARNING: Low data reliability. Responses may be rushed. Interpret cautiously.`
    *   The AI then outputs a report with higher uncertainty and suggests "Re-assessment" rather than "Intervention."

---

## 7. Database Design

The schema is normalized to separate raw data from derived analytical data.

| Table | Purpose |
| :--- | :--- |
| `users` | Identity management and Role (Student/Mentor). |
| `survey_sessions` | Tracks start/end times and completion status. |
| `answers` | Persistent storage of raw choices (A, B, C, D). |
| `response_metadata` | Telemetry: `time_taken_ms`, `change_count`. |
| `domain_scores` | Calculated numerical scores (0-100) per psychological domain. |
| `student_results`  | Aggregates scores, risks, and raw data for easy querying. |
| `reliability_metrics` | Stores `consistency_score`, `is_speed_running`, etc. |
| `rag_contexts` | Auditable log of exactly what data + knowledge was sent to the AI. |
| `mentor_notes` | Private notes written by mentors for case management. |

---

## 8. Mentor System

The Mentor Dashboard applies **Triage Logic** to help faculty focus on those most in need.

*   **Focus Queue:** Students are ranked by an `urgency_score` (calculated from Risk Level + Risk Trends). Critically at-risk students appear at the top in Red.
*   **Progressive Disclosure UI:**
    1.  **Level 1 (Card):** Name, Risk Trend (deteriorating/improving), Top 3 concerns.
    2.  **Level 2 (Detail):** Full domain profile, Reliability Score, Sparkline history.
    3.  **Level 3 (AI Insight):** Deep dive into specific patterns and conversation guides.
*   **Human-in-the-Loop:** The system never auto-emails students. It only informs the mentor. The mentor must decide to act.

---

## 9. Student System

*   **Authentication:** Google OAuth2 (School Domain Locked).
*   **Survey Experience:**
    *   Animated, single-question view to reduce cognitive load.
    *   Progress bar to reduce abandonment.
    *   Non-judgmental wording ("Reflection" instead of "Test").
*   **Privacy:** Students only see their completion status. They do **not** see their clinical scores or risk labels to prevent anxiety or self-stigmatization.

---

## 10. Safety & Ethics

**Safety-First Restrictions:**
1.  **No Diagnosis:** The AI is prompted to never use clinical labels (e.g., "You have Major Depression"). It uses descriptive language ("Patterns consistent with elevated sadness").
2.  **No Automated Decision Making:** The AI outputs "Suggestions" and "Guidance," never "Decisions."
3.  **Reliability Transparency:** Mentors are explicitly told if the data is suspect (rushed/contradictory), preventing false alarms based on bad data.
4.  **Crisis Detection:** Specific logic (`riskScoring.ts`) hard-codes checks for the "Suicide Triad" (Hopelessness + Dissatisfaction + Numbness) to bypass standard thresholds and flag `CRITICAL`.

---

## 11. Current Capabilities

*   ✅ **Secure Auth:** Domain-restricted Google Login.
*   ✅ **Full Survey Engine:** Support for Likert scales, branching, and metadata tracking.
*   ✅ **Advanced Scoring:** Multi-domain scoring with weighted logic.
*   ✅ **Reliability Filtering:** Detection of invalid or low-effort submissions.
*   ✅ **AI Reasoning:** Functional RAG pipeline interacting with Gemini 2.0.
*   ✅ **Mentor Triage:** Dashboard with priority queues and student search.
*   ✅ **Case Management:** Ability to write and save notes per student.

---

## 12. Limitations

*   **Deployment:** Currently configured for local/containerized deployment. needs production SSL/Domain setup.
*   **Knowledge Base:** The vector store (`knowledge_chunks`) currently requires manual population via SQL scripts.
*   **Longitudinal Analytics:** While the frontend displays trends, the backend analytics aggregation is basic.

---

## 13. Future Roadmap

1.  **Admin Panel:** UI for uploading/managing RAG knowledge chunks.
2.  **Student Feedback:** Safe, approved automated feedback to students (e.g., "Here are some sleep tips") for low-risk cases.
3.  **Crisis Integration:** Direct webhook integration with campus counseling services for `CRITICAL` flags.
4.  **Batch Analytics:** Department-wide mental health heatmaps.

---

## 14. Technical Decisions & Rationale

*   **Structured Outputs (JSON):** We utilize Gemini's structured output mode strictly. This prevents the "wall of text" problem common in AI tools and allows the UI to render helpful, distinct widgets.
*   **Separation of Concerns:** `RiskScoring` is deterministic (math), while `RagService` is probabilistic (reasoning). This ensures that even if the AI fails, the hard numerical risk scores remain accurate and accessible.
*   **Reliability as a First-Class Citizen:** In mental health data, *how* a student answers is often as important as *what* they answer. Treating reliability as a core metric prevents "garbage in, garbage out."

---

## 15. Testing & Validation

*   **Logic Verification:** Unit tests for `RiskScoring` logic (verifying inputs map to correct domains).
*   **Manual Scenarios:**
    *   *Scenario A (Crisis):* Simulating the "Suicidality Triad" verifies the dashboard flags `CRITICAL` immediately.
    *   *Scenario B (Speed Run):* Answering all questions in <30s verifies the `Low Reliability` badge appears.
*   **Integration Testing:** full end-to-end flow from Survey POST -> Database -> Mentor View.

---

## 16. Conclusion

The platform represents a significant step forward in student wellbeing technology. By combining **deterministic safety checks** with **probabilistic AI reasoning**, it offers a tool that is both safe enough for institutional use and powerful enough to provide genuine insight. It is currently at a "Pilot Ready" maturity level, suitable for controlled deployment with a small cohort of mentors and students.
