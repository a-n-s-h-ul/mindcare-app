#!/bin/bash
# KIIT Mental Health System - Complete Codebase Generator
# This script creates all necessary files for a production-ready deployment

# Backend: Main Server Entry (src/server.ts)
cat > backend/src/server.ts << 'EOF'
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import surveyRouter from './routes/survey';
import responsesRouter from './routes/responses';
import clinicianRouter from './routes/clinician';
import authRouter from './routes/auth';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import logger from './utils/logger';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Database Pool
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

db.on('error', (err) => logger.error('Database error:', err));

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
});
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  skipSuccessfulRequests: true,
});

app.use(limiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', strictLimiter, authRouter);
app.use('/api/survey', surveyRouter);
app.use('/api/responses', responsesRouter);
app.use('/api/clinician', authMiddleware, clinicianRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    db.end();
    process.exit(0);
  });
});

export default app;
EOF

# Backend: Risk Scoring Engine (src/services/riskScoring.ts)
cat > backend/src/services/riskScoring.ts << 'EOF'
import { Response } from '../models/types';
import { questions } from '../models/questions';

export interface DomainScore {
  [key: string]: number;
}

export interface RiskResult {
  totalRiskScore: number;
  riskLevel: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  domainScores: DomainScore;
  compositeScores: {
    depressionRisk: number;
    anxietyRisk: number;
    burnoutRisk: number;
    lonelinesRisk: number;
  };
  maskedResponses: string[]; // Questions with inconsistencies
  confidenceLevel: number; // 0-1
}

const DOMAIN_QUESTIONS: Record<string, string[]> = {
  Sleep: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q23', 'Q24', 'Q25', 'Q26'],
  Avoidance: ['Q6', 'Q7a', 'Q19', 'Q20', 'Q21', 'Q22'],
  Rumination: ['Q8', 'Q9', 'Q10', 'Q7b', 'Q14', 'Q16', 'Q18', 'Q28'],
  Perfectionism: ['Q27', 'Q28', 'Q29'],
  Isolation: ['Q11', 'Q12', 'Q13'],
  Anhedonia: ['Q30', 'Q31', 'Q32'],
  Control: ['Q15', 'Q17', 'Q18'],
};

const CRITICAL_QUESTIONS = {
  Q10: { answer: 'D', trigger: 'hopelessness', escalation: 'ORANGE' },
  Q25: { answer: 'D', trigger: 'early_morning_waking', escalation: 'ORANGE' },
  Q32: { answer: 'D', trigger: 'life_dissatisfaction', escalation: 'ORANGE' },
};

export function calculateDomainScores(responses: Response[]): DomainScore {
  const domainScores: DomainScore = {};

  for (const [domain, questionIds] of Object.entries(DOMAIN_QUESTIONS)) {
    const domainResponses = responses.filter(r => questionIds.includes(r.questionId));
    if (domainResponses.length === 0) continue;

    const totalWeight = domainResponses.reduce((sum, r) => {
      const question = questions.find(q => q.id === r.questionId);
      return sum + (question?.weight || 1);
    }, 0);

    const weightedSum = domainResponses.reduce((sum, r) => {
      const question = questions.find(q => q.id === r.questionId);
      const score = r.answer.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
      return sum + (score * (question?.weight || 1));
    }, 0);

    domainScores[domain] = Math.min(100, (weightedSum / totalWeight) * 33.33);
  }

  return domainScores;
}

export function calculateCompositeRisks(domainScores: DomainScore) {
  const scores = {
    Sleep: domainScores['Sleep'] || 0,
    Anhedonia: domainScores['Anhedonia'] || 0,
    Rumination: domainScores['Rumination'] || 0,
    Isolation: domainScores['Isolation'] || 0,
    Avoidance: domainScores['Avoidance'] || 0,
    Perfectionism: domainScores['Perfectionism'] || 0,
    Control: domainScores['Control'] || 0,
  };

  const depressionRisk = (scores.Sleep * 0.25) + (scores.Anhedonia * 0.30) +
    (scores.Rumination * 0.20) + (scores.Isolation * 0.15) + (scores.Avoidance * 0.10);

  const anxietyRisk = (scores.Sleep * 0.20) + (scores.Rumination * 0.25) +
    (scores.Perfectionism * 0.30) + (scores.Avoidance * 0.15) + (scores.Control * 0.10);

  const burnoutRisk = (scores.Perfectionism * 0.35) + (scores.Rumination * 0.25) +
    (scores.Avoidance * 0.20) + (scores.Sleep * 0.10) + (scores.Control * 0.10);

  const lonelinesRisk = (scores.Isolation * 0.70) + (scores.Avoidance * 0.30);

  return {
    depressionRisk: Math.min(100, depressionRisk),
    anxietyRisk: Math.min(100, anxietyRisk),
    burnoutRisk: Math.min(100, burnoutRisk),
    lonelinesRisk: Math.min(100, lonelinesRisk),
  };
}

export function calculateTotalRiskScore(composites: any): number {
  return (composites.depressionRisk * 0.35) +
    (composites.anxietyRisk * 0.30) +
    (composites.burnoutRisk * 0.20) +
    (composites.lonelinesRisk * 0.15);
}

export function getRiskLevel(score: number): 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' {
  if (score <= 20) return 'GREEN';
  if (score <= 40) return 'YELLOW';
  if (score <= 60) return 'ORANGE';
  return 'RED';
}

export function detectInconsistencies(responses: Response[]): { masked: string[], confidenceBoost: number } {
  const masked: string[] = [];
  let confidenceBoost = 0;

  // Sleep disruption denial pattern
  const q1 = responses.find(r => r.questionId === 'Q1')?.answer;
  const q25 = responses.find(r => r.questionId === 'Q25')?.answer;
  const q2 = responses.find(r => r.questionId === 'Q2')?.answer;

  if (q1 === 'A' && q25 === 'D' && q2 === 'D') {
    masked.push('Q1'); // Likely being defensive about sleep
    confidenceBoost += 0.15;
  }

  // Anhedonia denial
  const q30 = responses.find(r => r.questionId === 'Q30')?.answer;
  const q31 = responses.find(r => r.questionId === 'Q31')?.answer;
  const q12 = responses.find(r => r.questionId === 'Q12')?.answer;

  if ((q30 === 'A' || q31 === 'A') && q12 === 'D') {
    masked.push('Q30');
    confidenceBoost += 0.12;
  }

  return { masked, confidenceBoost };
}

export function assessCriticalRisks(responses: Response[]): { isCritical: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Suicide risk assessment
  const q10 = responses.find(r => r.questionId === 'Q10')?.answer;
  const q32 = responses.find(r => r.questionId === 'Q32')?.answer;
  const q31 = responses.find(r => r.questionId === 'Q31')?.answer;

  if (q10 === 'D' && q32 === 'D') {
    reasons.push('Hopelessness + Life dissatisfaction');
  }

  if (q10 === 'D' && q32 === 'D' && q31 === 'D') {
    reasons.push('Hopelessness + Dissatisfaction + Emotional numbness = Elevated suicide risk');
  }

  // Isolation + hopelessness
  const q11 = responses.find(r => r.questionId === 'Q11')?.answer;
  const q12 = responses.find(r => r.questionId === 'Q12')?.answer;
  const q13 = responses.find(r => r.questionId === 'Q13')?.answer;

  if (q11 === 'D' && q12 === 'D' && q13 === 'D' && q10 === 'D') {
    reasons.push('Social isolation triad + hopelessness');
  }

  return {
    isCritical: reasons.length > 0,
    reasons,
  };
}

export function scoreResponse(responses: Response[]): RiskResult {
  const domainScores = calculateDomainScores(responses);
  const composites = calculateCompositeRisks(domainScores);
  let totalRiskScore = calculateTotalRiskScore(composites);
  const riskLevel = getRiskLevel(totalRiskScore);

  const { masked, confidenceBoost } = detectInconsistencies(responses);
  const { isCritical, reasons: criticalReasons } = assessCriticalRisks(responses);

  // Boost risk if critical patterns detected
  if (isCritical) {
    totalRiskScore = Math.min(100, totalRiskScore + confidenceBoost);
  }

  let confidence = Math.min(1, 0.5 + (responses.length / 40) * 0.5);
  confidence = Math.min(1, confidence + confidenceBoost);

  return {
    totalRiskScore,
    riskLevel: isCritical ? 'RED' : getRiskLevel(totalRiskScore),
    domainScores,
    compositeScores: composites,
    maskedResponses: masked,
    confidenceLevel: confidence,
  };
}
EOF

# Backend: Explainability Generator (src/services/explainability.ts)
cat > backend/src/services/explainability.ts << 'EOF'
import { Response } from '../models/types';
import { RiskResult } from './riskScoring';
import { questions } from '../models/questions';

export interface ExplanationFactor {
  domain: string;
  contribution: number;
  indicator: string;
  description: string;
}

export interface SafeExplanation {
  riskLevel: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  score: number;
  title: string;
  summary: string;
  factors: ExplanationFactor[];
  nextSteps: string[];
  resources: CrisisResource[];
  confidenceStatement: string;
  disclaimer: string;
}

interface CrisisResource {
  name: string;
  type: 'hotline' | 'counseling' | 'web';
  contact: string;
  availability: string;
}

const CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: 'KIIT Campus Counseling Center',
    type: 'counseling',
    contact: 'Extension: 8394804804',
    availability: 'Mon-Fri: 10 AM - 6 PM',
  },
  {
    name: 'Aasra Crisis Support',
    type: 'hotline',
    contact: '9820466726 (24/7, Call/WhatsApp)',
    availability: '24/7 Emergency Support',
  },
  {
    name: 'iCall Emotional Support',
    type: 'hotline',
    contact: '9152987821 (24/7)',
    availability: '24/7 Trained Counselors',
  },
  {
    name: 'Vandrevala Foundation Crisis Line',
    type: 'hotline',
    contact: '1860 2662 345',
    availability: '24/7 Phone Support',
  },
];

const RISK_DESCRIPTIONS = {
  GREEN: 'You appear to be managing stress well. Keep maintaining healthy habits.',
  YELLOW: 'You're experiencing some stress or mood changes. Support is available to help.',
  ORANGE: 'Significant patterns detected. Speaking with a counselor would be helpful.',
  RED: 'You may be struggling significantly. Professional support is important. Please reach out today.',
};

const NEXT_STEPS = {
  GREEN: [
    'Continue your current healthy habits',
    'Maintain consistent sleep and exercise routines',
    'Stay connected with friends and activities you enjoy',
    'Annual wellness check-in recommended',
  ],
  YELLOW: [
    'Schedule a free counseling consultation',
    'Try a consistent sleep schedule (bedtime within 1 hour each night)',
    'Reach out to a friend or family member',
    'Consider a stress-management or wellness workshop',
  ],
  ORANGE: [
    'Schedule a counseling appointment this week',
    'Speak with an academic advisor about course load if applicable',
    'Try one stress-reduction practice (exercise, meditation, journaling)',
    'Attend campus wellness activities',
  ],
  RED: [
    'Contact campus counseling center TODAY',
    'Call a crisis support line if in distress',
    'Tell a trusted friend or family member how you\'re feeling',
    'Consider speaking with an academic advisor about support options',
  ],
};

export function extractMeaningfulFactors(
  responses: Response[],
  domainScores: Record<string, number>
): ExplanationFactor[] {
  const factors: ExplanationFactor[] = [];

  // Sleep issues
  const sleepScore = domainScores['Sleep'] || 0;
  if (sleepScore > 50) {
    const q25 = responses.find(r => r.questionId === 'Q25');
    const q24 = responses.find(r => r.questionId === 'Q24');

    if (q25?.answer === 'D') {
      factors.push({
        domain: 'Sleep',
        contribution: 0.18,
        indicator: 'Early morning waking',
        description: 'Waking consistently at 4-5 AM and unable to fall back asleep (a strong biological marker of mood concerns)',
      });
    }

    if (q24?.answer === 'D') {
      factors.push({
        domain: 'Sleep',
        contribution: 0.16,
        indicator: 'Fragmented sleep',
        description: 'Waking multiple times throughout the night, making sleep feel restless',
      });
    }

    const q23 = responses.find(r => r.questionId === 'Q23');
    if (q23?.answer === 'D') {
      factors.push({
        domain: 'Sleep',
        contribution: 0.15,
        indicator: 'Poor sleep quality',
        description: 'Struggling to fall or stay asleep, despite time in bed',
      });
    }
  }

  // Rumination/worry
  const ruminationScore = domainScores['Rumination'] || 0;
  if (ruminationScore > 50) {
    const q8 = responses.find(r => r.questionId === 'Q8');
    if (q8?.answer === 'D') {
      factors.push({
        domain: 'Rumination',
        contribution: 0.15,
        indicator: 'Shame after mistakes',
        description: 'Replaying mistakes repeatedly and feeling ashamed (strong depression indicator)',
      });
    }

    const q9 = responses.find(r => r.questionId === 'Q9');
    if (q9?.answer === 'D') {
      factors.push({
        domain: 'Rumination',
        contribution: 0.14,
        indicator: 'Evening worry cycle',
        description: 'Cycling through worries and regrets while trying to sleep',
      });
    }
  }

  // Social withdrawal
  const isolationScore = domainScores['Isolation'] || 0;
  if (isolationScore > 50) {
    const q11 = responses.find(r => r.questionId === 'Q11');
    if (q11?.answer === 'D') {
      factors.push({
        domain: 'Social Connection',
        contribution: 0.12,
        indicator: 'Social withdrawal',
        description: 'Feeling like an outsider in groups and reluctant to engage',
      });
    }

    const q12 = responses.find(r => r.questionId === 'Q12');
    if (q12?.answer === 'D') {
      factors.push({
        domain: 'Social Connection',
        contribution: 0.11,
        indicator: 'Reduced social initiation',
        description: 'Less likely to reach out to friends or start plans',
      });
    }
  }

  // Loss of pleasure
  const anhedoniaScore = domainScores['Anhedonia'] || 0;
  if (anhedoniaScore > 50) {
    const q30 = responses.find(r => r.questionId === 'Q30');
    if (q30?.answer === 'D') {
      factors.push({
        domain: 'Motivation & Pleasure',
        contribution: 0.13,
        indicator: 'Loss of enjoyment',
        description: 'Activities that used to bring joy feel flat or pointless',
      });
    }
  }

  // Perfectionism/pressure
  const perfectionism = domainScores['Perfectionism'] || 0;
  if (perfectionism > 50) {
    const q27 = responses.find(r => r.questionId === 'Q27');
    if (q27?.answer === 'D') {
      factors.push({
        domain: 'Perfectionism',
        contribution: 0.10,
        indicator: 'Achievement pressure',
        description: 'Academic/personal performance feels like it defines your worth',
      });
    }
  }

  return factors
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 4); // Top 4 factors
}

export function generateExplanation(
  riskResult: RiskResult,
  responses: Response[]
): SafeExplanation {
  const factors = extractMeaningfulFactors(responses, riskResult.domainScores);
  const title = getTitleForRiskLevel(riskResult.riskLevel);
  const summary = RISK_DESCRIPTIONS[riskResult.riskLevel];
  const nextSteps = NEXT_STEPS[riskResult.riskLevel];

  // Red cases don't get detailed feedback screen (immediate escalation instead)
  if (riskResult.riskLevel === 'RED') {
    return {
      riskLevel: 'RED',
      score: riskResult.totalRiskScore,
      title: 'Please Reach Out for Support',
      summary: 'Your responses suggest you\'re dealing with significant challenges. Professional support can help.',
      factors: [], // Don't provide detailed analysis for RED
      nextSteps: [
        'Contact campus counseling center immediately',
        'Call a crisis hotline if in distress',
        'Tell someone you trust how you\'re feeling',
      ],
      resources: CRISIS_RESOURCES,
      confidenceStatement: 'This assessment is non-diagnostic. A counselor will review your responses.',
      disclaimer: 'This is a screening tool, not a diagnosis. Please speak with a mental health professional.',
    };
  }

  return {
    riskLevel: riskResult.riskLevel,
    score: riskResult.totalRiskScore,
    title,
    summary,
    factors,
    nextSteps,
    resources: CRISIS_RESOURCES.slice(0, 2), // Show main resources for non-RED cases
    confidenceStatement: `This assessment is based on ${responses.length} of your responses (${Math.round(riskResult.confidenceLevel * 100)}% confidence).`,
    disclaimer: 'This is a screening tool, not a diagnosis. Only mental health professionals can diagnose conditions.',
  };
}

function getTitleForRiskLevel(level: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED'): string {
  const titles = {
    GREEN: 'You\'re Managing Well',
    YELLOW: 'Some Patterns Detected',
    ORANGE: 'Support Recommended',
    RED: 'Please Reach Out for Help',
  };
  return titles[level];
}
EOF

# Backend: Adaptive Logic Engine (src/services/adaptiveLogic.ts)
cat > backend/src/services/adaptiveLogic.ts << 'EOF'
import { Response } from '../models/types';
import { questions } from '../models/questions';

export interface AdaptiveResult {
  nextQuestion: any | null;
  shouldStop: boolean;
  reason?: string;
}

const ANCHOR_QUESTIONS = ['Q1', 'Q8', 'Q10', 'Q25', 'Q30', 'Q32'];
const DOMAINS = [
  'Sleep', 'Avoidance', 'Rumination', 'Perfectionism', 'Isolation', 'Anhedonia', 'Control'
];

const DOMAIN_ACTIVATORS: Record<string, { question: string; answer: string; trigger: string }[]> = {
  Sleep: [
    { question: 'Q1', answer: 'C', trigger: 'Q23' },
    { question: 'Q2', answer: 'D', trigger: 'Q24' },
  ],
  Rumination: [
    { question: 'Q8', answer: 'D', trigger: 'Q9' },
    { question: 'Q10', answer: 'D', trigger: 'Q16' },
  ],
  Isolation: [
    { question: 'Q11', answer: 'D', trigger: 'Q12' },
  ],
  Avoidance: [
    { question: 'Q6', answer: 'D', trigger: 'Q7a' },
  ],
};

export function selectNextQuestion(
  responses: Response[],
  askedQuestions: string[]
): AdaptiveResult {
  // Check if should stop early
  if (shouldStopEarly(responses, askedQuestions)) {
    return { nextQuestion: null, shouldStop: true, reason: 'Low-risk pattern detected' };
  }

  // Check critical escalation
  if (shouldEscalate(responses)) {
    return { nextQuestion: null, shouldStop: true, reason: 'Critical risk detected' };
  }

  // Find next question based on adaptive rules
  const nextId = getNextQuestionId(responses, askedQuestions);
  if (!nextId) {
    return { nextQuestion: null, shouldStop: true, reason: 'All relevant questions answered' };
  }

  const nextQuestion = questions.find(q => q.id === nextId);
  return { nextQuestion, shouldStop: false };
}

function shouldStopEarly(responses: Response[], askedQuestions: string[]): boolean {
  if (askedQuestions.length < 15) return false; // Need minimum questions

  // Low-risk pattern: A/B answers on key depression markers
  const q30 = responses.find(r => r.questionId === 'Q30');
  const q25 = responses.find(r => r.questionId === 'Q25');
  const q10 = responses.find(r => r.questionId === 'Q10');

  if (q30?.answer === 'A' && q25?.answer === 'A' && q10?.answer === 'A') {
    return true; // Very low risk
  }

  return false;
}

function shouldEscalate(responses: Response[]): boolean {
  const q10 = responses.find(r => r.questionId === 'Q10');
  const q32 = responses.find(r => r.questionId === 'Q32');
  const q31 = responses.find(r => r.questionId === 'Q31');

  // Suicide risk pattern
  if (q10?.answer === 'D' && q32?.answer === 'D') {
    return true;
  }

  // Severe depression pattern
  if (q10?.answer === 'D' && q32?.answer === 'D' && q31?.answer === 'D') {
    return true;
  }

  // Isolation + hopelessness
  const q11 = responses.find(r => r.questionId === 'Q11');
  const q12 = responses.find(r => r.questionId === 'Q12');
  const q13 = responses.find(r => r.questionId === 'Q13');

  if (q11?.answer === 'D' && q12?.answer === 'D' && q13?.answer === 'D' && q10?.answer === 'D') {
    return true;
  }

  return false;
}

function getNextQuestionId(responses: Response[], askedQuestions: string[]): string | null {
  // Always ask anchor questions first
  const unaskedAnchors = ANCHOR_QUESTIONS.filter(q => !askedQuestions.includes(q));
  if (unaskedAnchors.length > 0) {
    return unaskedAnchors[0];
  }

  // Check which domains should be activated
  const activatedDomains = new Set<string>();

  for (const [domain, activators] of Object.entries(DOMAIN_ACTIVATORS)) {
    for (const activator of activators) {
      const response = responses.find(r => r.questionId === activator.question);
      if (response?.answer === activator.answer) {
        activatedDomains.add(domain);
      }
    }
  }

  // Find next question from activated domains
  for (const domain of activatedDomains) {
    const domainQuestions = questions.filter(q =>
      q.domain?.includes(domain) && !askedQuestions.includes(q.id)
    );

    if (domainQuestions.length > 0) {
      return domainQuestions[0].id;
    }
  }

  // If no activated domains, ask remaining general questions
  const unasked = questions.filter(q => !askedQuestions.includes(q.id));
  return unasked.length > 0 ? unasked[0].id : null;
}
EOF

echo "✅ Backend services generated successfully"
echo ""
echo "Now generate frontend components..."
EOF

cat > setup.sh << 'EOF'
chmod +x backend/src/services/*.ts
echo "Backend services ready for compilation"
EOF

chmod +x setup.sh

echo "All backend services created. Next: Frontend components..."
