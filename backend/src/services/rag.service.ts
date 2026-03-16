/**
 * RAG Service - Production Implementation
 * 
 * Real Retrieval-Augmented Generation pipeline using:
 * - pgvector for similarity search
 * - OpenRouter API for LLM synthesis
 * - Structured JSON output only
 * 
 * SAFETY: AI never talks to students, never diagnoses, requires human approval
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { VectorService, RetrievedChunk, RetrievalQuery } from './vector.service';
import logger from '../utils/logger';
import { ReliabilityMetrics, TrendAnalysis } from '../models/types';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const LLM_MODEL = process.env.RAG_LLM_MODEL || 'gemini-2.0-flash-lite';


// Strict output schema type
export interface RagOutput {
    dominant_domains: string[];
    pattern_clusters: string[];
    probable_contributors: string[];
    risk_level: 'low' | 'moderate' | 'high' | 'critical';
    protective_factors: string[];
    reasoning_summary: string[];
    intervention_suggestions: string[];
    conversation_guide: string[];
    conversation_guidance?: string[];
    escalation_required: boolean;
    report?: any;
    explainability: {
        why: string[];
        evidence: string[];
        domain_contributions: Array<{ domain: string; score: number; contribution: string }>;
        confidence: 'low' | 'medium' | 'high';
        retrieved_chunks: Array<{ id: string; excerpt: string; relevance: number }>;
    };
}

export interface StudentProfile {
    scores: Record<string, number>;
    patterns: Array<{ name: string; confidence: number; contributors: string[] }>;
    risk: { overall_risk: string; flags: Record<string, string> };
    history?: TrendAnalysis;
    audioContext?: { transcript: string; mood: string; confidence: string }[];
}

export class RagService {
    /**
     * Generate mentor report with real RAG pipeline
     */
    static async generateMentorReport(
        studentProfile: StudentProfile,
        mentorIntent?: string,
        reliability?: ReliabilityMetrics
    ): Promise<RagOutput> {
        const startTime = Date.now();

        // Safely extract pattern names - handle both string arrays and object arrays
        const patternNames = (studentProfile.patterns || []).map((p: any) => {
            if (typeof p === 'string') return p;
            return p?.name || String(p);
        }).filter(Boolean);

        // 1. Build retrieval query from structured profile
        const retrievalQuery: RetrievalQuery = {
            domainScores: studentProfile.scores || {},
            patterns: patternNames,
            riskLevel: studentProfile.risk?.overall_risk || 'moderate',
            mentorIntent
        };

        // 2. Retrieve relevant knowledge chunks
        console.log('[RAG] Starting retrieval pipeline...');
        const retrievedChunks = await VectorService.retrieveWithRanking(retrievalQuery);
        console.log(`[RAG] Retrieved ${retrievedChunks.length} relevant chunks`);

        // 3. Build context for LLM
        const context = this.buildLLMContext(studentProfile, retrievedChunks, reliability);

        // 4. Generate structured output via LLM
        console.log('[RAG] Generating synthesized report via LLM...');
        // 4. Generate structured output via LLM
        console.log('[RAG] Generating synthesized report via LLM...');
        const ragOutput = await this.synthesize(context, studentProfile, reliability);

        // 5. Add explainability metadata
        ragOutput.explainability.retrieved_chunks = retrievedChunks.map(c => ({
            id: c.id,
            excerpt: c.content.substring(0, 200) + '...',
            relevance: Math.round(c.similarity * 100) / 100
        }));

        // Add reliability confidence to output
        if (reliability) {
            ragOutput.explainability.confidence = reliability.confidence.toLowerCase() as 'low' | 'medium' | 'high';
        }

        const processingTime = Date.now() - startTime;
        console.log(`[RAG] Report generated in ${processingTime}ms`);
        // ... (logging)

        return ragOutput;
    }

    /**
     * Build context for LLM synthesis
     */
    private static buildLLMContext(
        profile: StudentProfile,
        chunks: RetrievedChunk[],
        reliability?: ReliabilityMetrics
    ): string {
        const contextParts: string[] = [];

        // 1. Structured student state (NOT raw answers)
        contextParts.push('## STUDENT PSYCHOLOGICAL STATE');
        contextParts.push(`Risk Level: ${profile.risk.overall_risk.toUpperCase()}`);

        // --- RELIABILITY SIGNAL INJECTION ---
        if (reliability) {
            contextParts.push(`\n### DATA CONFIDENCE: ${reliability.confidence}`);
            if (reliability.confidence === 'LOW') {
                contextParts.push('WARNING: Low data reliability detected. Responses may be rushed or inconsistent.');
                if (reliability.isSpeedRunning) contextParts.push('- Indicators: High-speed completion detected.');
                if (reliability.consistencyScore < 0.8) contextParts.push('- Indicators: Internal contradictions found in responses.');
                contextParts.push('INSTRUCTION: Interpret patterns cautiously. Do not assume high accuracy.');
            }
        }

        // --- TREND ANALYSIS ---
        if (profile.history) {
            contextParts.push(`\n### LONGITUDINAL TRENDS: ${profile.history.trend.toUpperCase()}`);
            if (profile.history.riskEscalation) {
                contextParts.push('CRITICAL WARNING: Significant escalation in risk markers detected compared to previous sessions.');
            }
            if (profile.history.significantChanges.length > 0) {
                contextParts.push('Significant Changes:');
                profile.history.significantChanges.forEach(change => contextParts.push(`- ${change}`));
            }
        }
        // --- ADDITIONAL AUDIO CONTEXT ---
        if (profile.audioContext && profile.audioContext.length > 0) {
            contextParts.push('\n### VOICE ANALYSIS SUMMARY:');
            profile.audioContext.forEach((audio, idx) => {
                contextParts.push(`Audio Q${idx + 1}:`);
                contextParts.push(`- Detected Mood: ${audio.mood} (Confidence: ${audio.confidence})`);
                contextParts.push(`- Transcript: "${audio.transcript}"`);
            });
            contextParts.push('\nINSTRUCTION: Factor these voice notes and tones heavily into the final analysis.');
        }
        // ------------------------------------

        // Domain scores
        contextParts.push('\n### Domain Scores:');
        Object.entries(profile.scores)
            .sort((a: any, b: any) => b[1] - a[1])
            .forEach(([domain, score]: any) => {
                const level = score > 70 ? 'ELEVATED' : score > 50 ? 'MODERATE' : 'LOW';
                contextParts.push(`- ${domain}: ${score}/100 (${level})`);
            });

        // Detected patterns
        contextParts.push('\n### Detected Patterns:');
        profile.patterns.forEach(p => {
            // ... (rest of function)
            contextParts.push(`- ${p.name} (confidence: ${Math.round(p.confidence * 100)}%)`);
        });

        // Risk flags
        contextParts.push('\n### Risk Flags:');
        Object.entries(profile.risk.flags).forEach(([flag, level]: any) => {
            contextParts.push(`- ${flag}: ${level}`);
        });

        // 2. Retrieved knowledge context
        // ... (rest of function)
        contextParts.push('\n\n## RETRIEVED KNOWLEDGE CONTEXT');

        const chunksByType = chunks.reduce((acc, c) => {
            if (!acc[c.chunkType]) acc[c.chunkType] = [];
            acc[c.chunkType].push(c);
            return acc;
        }, {} as Record<string, RetrievedChunk[]>);

        Object.entries(chunksByType).forEach(([type, typeChunks]: any) => {
            contextParts.push(`\n### ${type.toUpperCase()} Knowledge:`);
            typeChunks.forEach((c: any, i: any) => {
                contextParts.push(`[${type}-${i + 1}] ${c.content}`);
            });
        });

        return contextParts.join('\n');
    }

    /**
     * Synthesize structured output via LLM
     */
    /**
     * Synthesize structured output via LLM using the new System Prompt
     */
    private static async synthesize(
        context: string,
        profile: StudentProfile,
        reliability?: ReliabilityMetrics
    ): Promise<RagOutput> {

        // Construct the structured input object as requested by the System Prompt
        const inputData = {
            domain_scores: profile.scores,
            pattern_clusters: (profile.patterns || []).map(p => ({
                name: p.name,
                confidence: p.confidence
            })),
            risk_flags: profile.risk.flags,
            longitudinal_trends: profile.history ? {
                trend: profile.history.trend,
                risk_escalation: profile.history.riskEscalation,
                changes: profile.history.significantChanges
            } : null,
            audio_analysis: profile.audioContext || null,
            reliability_metrics: reliability ? {
                reliability_score: reliability.score,
                consistency_score: reliability.consistencyScore,
                interpretation_confidence: reliability.confidence,
                trend_confidence: profile.history && profile.history.historyLength > 2 ? 'high' : 'low'
            } : null,
            retrieved_context: context
        };

        const systemPrompt = `
You are an AI reasoning assistant for a mentor-supported student wellbeing system.

You analyze structured psychological signals and provide decision-support insights for human mentors. You do NOT diagnose, label disorders, or determine whether a student is truthful. You synthesize patterns and express confidence levels.

INPUT STRUCTURE:
You will receive a structured object with:
- domain_scores
- pattern_clusters
- risk_flags
- longitudinal_trends
- context_tags (exam period, workload spikes, etc.)
- reliability_metrics:
    - reliability_score
    - consistency_score
    - interpretation_confidence
    - trend_confidence

REASONING RULES:

1. Domain scores and pattern clusters determine the primary interpretation.
2. Longitudinal trends indicate change over time and are highly important.
3. Context tags explain situational stress and must be considered.
4. Reliability metrics adjust how confident the interpretation should be.
5. Reliability metrics must NEVER be used to accuse or infer deception.
6. If reliability is low, reduce certainty and emphasize uncertainty.
7. If reliability is high, interpretations may be more confident.
8. Risk flags indicate areas needing attention but are not diagnoses.
9. CROSS-MODAL CORRELATION: Explicitly compare the 'audio_analysis' (tone, transcript, observations) with 'domain_scores'. 
   - If audio tone (e.g., 'Anxious') conflicts with low domain scores, suggest potential under-reporting.
   - If transcript content adds depth to specific clusters, highlight the spoken evidence.
10. When trends and reliability conflict, prefer caution and uncertainty.

OUTPUT REQUIREMENTS:

Return a structured JSON object with the following fields:

{
  "dominant_domains": [],
  "pattern_summary": "",
  "trend_interpretation": "",
  "contextual_factors": [],
  "risk_level": "low | moderate | high | critical",
  "interpretation_confidence": "low | medium | high",
  "confidence_reasoning": "",
  "mentor_guidance": [],
  "uncertainty_notes": [],
  "explainability": {
      "key_signals_used": [],
      "context_considered": [],
      "confidence_adjustments": []
  }
}

CONFIDENCE CALIBRATION:

If reliability_score or interpretation_confidence is low:
- Do not change the domain conclusions automatically.
- Instead reduce interpretation confidence.
- Add uncertainty_notes.
- Suggest cautious interpretation.
- Encourage follow-up observation.

If reliability is high:
- Interpret patterns normally.
- Provide clearer reasoning.
- Still avoid deterministic language.

LANGUAGE CONSTRAINTS:

Never use:
- fake
- lying
- dishonest
- exaggerating
- malingering

Use instead:
- "interpretation confidence"
- "data reliability"
- "pattern stability"
- "uncertain interpretation"

MENTOR ROLE:

You are assisting a human mentor.
You provide insights, not decisions.
Human judgment is final.

Return only valid JSON.
        `;

        const fullPrompt = `${systemPrompt}\n\nINPUT DATA:\n${JSON.stringify(inputData, null, 2)}`;

        // Use Google Generative AI SDK directly with retry logic
        console.log(`[RAG] Calling Gemini with model: ${LLM_MODEL}`);

        const model = genAI.getGenerativeModel({ model: LLM_MODEL });

        let text = '{}';
        const MAX_RETRIES = 3;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 2500,
                    },
                });
                text = result.response.text() || '{}';
                break; // success
            } catch (retryErr: any) {
                const is429 = retryErr.message?.includes('429');
                if (is429 && attempt < MAX_RETRIES) {
                    const waitMs = attempt * 5000; // 5s, 10s, 15s
                    console.warn(`[RAG] Rate limited (429). Retry ${attempt}/${MAX_RETRIES} in ${waitMs / 1000}s...`);
                    await new Promise(r => setTimeout(r, waitMs));
                } else {
                    throw retryErr;
                }
            }
        }
        console.log('[RAG] Raw LLM response length:', text.length);

        let report;
        try {
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            report = JSON.parse(cleanText);
            if (Array.isArray(report)) report = report[0] || {};
        } catch (e) {
            console.error('[RAG] Failed to parse LLM output:', e);
            report = {
                pattern_summary: "Analysis failed.",
                mentor_guidance: [],
                explainability: {}
            };
        }

        // Map to internal RagOutput structure for frontend compatibility
        // We preserve the new report in the 'report' field for future UI updates
        return {
            dominant_domains: report.dominant_domains || [],
            pattern_clusters: (profile.patterns || []).map(p => p.name),
            probable_contributors: report.explainability?.key_signals_used || [],
            risk_level: this.normalizeRiskLevel(report.risk_level),
            protective_factors: [], // Not in new prompt?? Maybe derive from summary?
            reasoning_summary: [
                report.pattern_summary,
                `Trend: ${report.trend_interpretation || 'None'}`,
                `Confidence: ${report.confidence_reasoning}`
            ],
            intervention_suggestions: report.mentor_guidance || [], // Using guidance as interventions
            conversation_guide: report.mentor_guidance || [],
            conversation_guidance: report.mentor_guidance || [],
            escalation_required: report.risk_level === 'critical',
            report: report, // RAW REPORT SAVED HERE
            explainability: {
                why: [report.pattern_summary],
                evidence: report.explainability?.key_signals_used || [],
                domain_contributions: [],
                confidence: this.normalizeConfidence(report.interpretation_confidence),
                retrieved_chunks: []
            }
        };
    }

    private static normalizeRiskLevel(level: string): RagOutput['risk_level'] {
        const normalized = (level || 'moderate').toLowerCase();
        if (['low', 'moderate', 'high', 'critical'].includes(normalized)) {
            return normalized as RagOutput['risk_level'];
        }
        return 'moderate';
    }

    private static normalizeConfidence(conf: string): 'low' | 'medium' | 'high' {
        const normalized = (conf || 'medium').toLowerCase();
        if (['low', 'medium', 'high'].includes(normalized)) {
            return normalized as 'low' | 'medium' | 'high';
        }
        return 'medium';
    }

    /**
     * Chat with AI about specific student data
     */
    static async chatWithStudentData(
        studentProfile: StudentProfile,
        query: string,
        history: Array<{ role: 'user' | 'model'; message: string }>
    ): Promise<{ answer: string; citations: string[] }> {
        // 1. Build context similar to report generation
        // But focused on the query
        const retrievalQuery: RetrievalQuery = {
            domainScores: studentProfile.scores,
            patterns: studentProfile.patterns.map(p => p.name),
            riskLevel: studentProfile.risk.overall_risk,
            mentorIntent: query // Use the chat query as intent
        };

        const retrievedChunks = await VectorService.retrieveWithRanking(retrievalQuery);
        const context = this.buildLLMContext(studentProfile, retrievedChunks);

        // 2. Build history string
        const conversationHistory = history.map(h =>
            `${h.role === 'user' ? 'MENTOR' : 'AI'}: ${h.message}`
        ).join('\n');

        // 3. Generate response
        const systemPrompt = `You are a clinical assistant AI helping a university mentor understand a student's mental health profile.
        
        CONTEXT:
        ${context}

        RULES:
        - Answer based ONLY on the provided student data and psychological knowledge
        - Be concise, professional, and empathetic
        - If the information is not in the profile, say "I don't have enough data to answer that."
        - Mention specific scores or patterns if relevant to the question
        - Do NOT diagnose. Use terms like "indicators", "patterns", "risk factors"
        - Cite evidence sources [Knowledge-X] if you use them
        
        HISTORY:
        ${conversationHistory}
        
        MENTOR QUESTION: ${query}`;

        // Use Google Generative AI SDK directly
        const model = genAI.getGenerativeModel({ model: LLM_MODEL });
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\nMENTOR QUESTION: ' + query }] }],
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 1000,
            },
        });

        const responseText = result.response.text() || 'Unable to generate response.';

        return {
            answer: responseText,
            citations: retrievedChunks.map(c => `[Knowledge-${c.id.substring(0, 4)}]: ${c.content.substring(0, 50)}...`)
        };
    }
}
