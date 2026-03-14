/**
 * Knowledge Seeding Script
 * Ingests clinical knowledge, institutional context, and intervention frameworks
 */

import { IngestionService, DocumentChunk } from '../services/ingestion.service';
import pool from '../db/pool';

// Clinical Knowledge Base
const CLINICAL_KNOWLEDGE: DocumentChunk[] = [
    // Depression Patterns
    {
        content: "Early morning waking combined with anhedonia and emotional blunting is a classic melancholic depression pattern. This phenotype is associated with more severe symptom burden and may require more intensive intervention.",
        chunkType: "clinical",
        sourceDocument: "Clinical Reasoning Guide",
        sourceSection: "Depression Patterns"
    },
    {
        content: "Sleep architecture disruption is a cardinal marker of depressive episodes. Changes in REM latency, reduced slow-wave sleep, and early morning awakening are key indicators that predict treatment response.",
        chunkType: "clinical",
        sourceDocument: "Clinical Reasoning Guide",
        sourceSection: "Sleep and Mood"
    },
    {
        content: "High isolation scores correlate with 3x risk of academic dropout and 2.5x risk of crisis events. Social withdrawal is often a prodromal symptom that precedes major depressive episodes.",
        chunkType: "clinical",
        sourceDocument: "Clinical Reasoning Guide",
        sourceSection: "Isolation Risk"
    },
    {
        content: "Perfectionism combined with burnout creates a particularly difficult pattern. Students may appear high-functioning while experiencing significant distress. Watch for discrepancy between academic performance and wellbeing scores.",
        chunkType: "clinical",
        sourceDocument: "Clinical Reasoning Guide",
        sourceSection: "Perfectionism"
    },
    {
        content: "Anxiety-depression comorbidity is present in 60% of university mental health cases. When both domains score above 50, treatment complexity increases and response times may be longer.",
        chunkType: "clinical",
        sourceDocument: "Clinical Reasoning Guide",
        sourceSection: "Comorbidity"
    },

    // KIIT Institutional Context
    {
        content: "3rd year CSE students report highest stress levels due to placement pressure. Peak stress occurs during September-November placement season. Proactive outreach recommended during this period.",
        chunkType: "institutional",
        sourceDocument: "KIIT Context Guide",
        sourceSection: "Academic Pressure"
    },
    {
        content: "Hostel H-Block has reported higher isolation scores due to single-room layout. Students in single accommodation are 40% more likely to report loneliness. Recommend community-building interventions.",
        chunkType: "institutional",
        sourceDocument: "KIIT Context Guide",
        sourceSection: "Housing"
    },
    {
        content: "First-generation college students at KIIT face unique stressors including family pressure, impostor syndrome, and cultural adjustment. These students may benefit from peer mentoring programs.",
        chunkType: "institutional",
        sourceDocument: "KIIT Context Guide",
        sourceSection: "Demographics"
    },
    {
        content: "Distance from home correlates with adjustment difficulties. Students from Northeast regions and South India report higher initial stress but often develop strong peer networks by 2nd year.",
        chunkType: "institutional",
        sourceDocument: "KIIT Context Guide",
        sourceSection: "Geography"
    },

    // Intervention Frameworks
    {
        content: "CBT-I (Cognitive Behavioral Therapy for Insomnia) is the gold-standard intervention for sleep disruption in university students. 4-6 session protocol shows 70-80% improvement in sleep quality.",
        chunkType: "intervention",
        sourceDocument: "Intervention Protocols",
        sourceSection: "Sleep Interventions"
    },
    {
        content: "Social Activation Protocol: Encourage joining one campus club (e.g., Robotics, Dance, Drama) to break isolation patterns. Structured activities with regular meeting times are most effective.",
        chunkType: "intervention",
        sourceDocument: "Intervention Protocols",
        sourceSection: "Social Interventions"
    },
    {
        content: "Behavioral Activation: Start with 3 small pleasurable activities per week. Focus on activities that provide mastery or pleasure. Avoid overwhelming with too many changes simultaneously.",
        chunkType: "intervention",
        sourceDocument: "Intervention Protocols",
        sourceSection: "Depression Interventions"
    },
    {
        content: "Academic stress intervention: Break large tasks into smaller milestones. Use 25-5 minute work-break cycles (Pomodoro). Address perfectionism through cognitive restructuring.",
        chunkType: "intervention",
        sourceDocument: "Intervention Protocols",
        sourceSection: "Academic Interventions"
    },

    // Safety Protocols
    {
        content: "Suicide Risk Assessment Protocol: Use C-SSRS (Columbia Suicide Severity Rating Scale) for any student with isolation scores above 70 or depression above 75. Document findings and escalate per policy.",
        chunkType: "safety",
        sourceDocument: "Safety Protocols",
        sourceSection: "Risk Assessment"
    },
    {
        content: "Escalation Criteria: Immediate DSC referral required for any student expressing hopelessness, suicidal ideation, self-harm history, or sudden behavioral changes. Do not attempt to manage alone.",
        chunkType: "safety",
        sourceDocument: "Safety Protocols",
        sourceSection: "Escalation"
    },
    {
        content: "Crisis Contact Protocol: DSC hotline available 24/7. For immediate danger, contact Campus Security first, then DSC. Document all crisis contacts within 24 hours.",
        chunkType: "safety",
        sourceDocument: "Safety Protocols",
        sourceSection: "Crisis Response"
    },

    // Mentor Conversation Protocols
    {
        content: "Opening a difficult conversation: Start by validating the student's experience. Example: 'The screening shows you've been dealing with a lot. I want to understand better how you're feeling.'",
        chunkType: "protocol",
        sourceDocument: "Mentor Guide",
        sourceSection: "Conversation Starters"
    },
    {
        content: "Addressing sleep: 'How has your sleep been lately? Are you having trouble falling asleep, staying asleep, or waking up too early?' Follow up with routine questions.",
        chunkType: "protocol",
        sourceDocument: "Mentor Guide",
        sourceSection: "Sleep Assessment"
    },
    {
        content: "Addressing isolation: 'Who do you feel comfortable talking to in your hostel or classes?' If none: 'That sounds lonely. What's one small step we could take to connect you with others?'",
        chunkType: "protocol",
        sourceDocument: "Mentor Guide",
        sourceSection: "Social Connection"
    },
    {
        content: "Normalizing struggles: 'Many students feel overwhelmed during 3rd year with placements. What you're experiencing is more common than you might think, and we have support available.'",
        chunkType: "protocol",
        sourceDocument: "Mentor Guide",
        sourceSection: "Normalization"
    },
    {
        content: "Setting expectations: 'I want to check in with you regularly - would weekly meetings work? Between now and then, let's focus on just one small change: [specific goal].'",
        chunkType: "protocol",
        sourceDocument: "Mentor Guide",
        sourceSection: "Goal Setting"
    }
];

async function seedKnowledge() {
    console.log('=== STARTING KNOWLEDGE SEEDING ===');
    console.log(`Total chunks to ingest: ${CLINICAL_KNOWLEDGE.length}`);

    try {
        const result = await IngestionService.ingestBatch(CLINICAL_KNOWLEDGE);

        console.log(`\n=== SEEDING COMPLETE ===`);
        console.log(`Chunks created: ${result.chunksCreated}`);
        console.log(`Chunks skipped (duplicates): ${result.chunksSkipped}`);

        // Show stats
        const stats = await IngestionService.getStats();
        console.log('\nKnowledge Base Statistics:');
        console.table(stats);

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await pool.end();
    }
}

// Run if executed directly
seedKnowledge();
