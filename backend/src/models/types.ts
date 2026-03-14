
export interface QuestionOption {
    letter: string;
    text: string;
    score: number;
}

export interface Question {
    id: string;
    section: string;
    text: string;
    type: string;
    options: QuestionOption[];
    domain: string[];
    weight: number;
    indicator: string;
    mandatory: boolean;
    followUp: string | null;
}

export interface UserResponse {
    questionId: string;
    answer: string; // 'A', 'B', 'C', 'D'
    timestamp: string;
}

export interface Session {
    id: string;
    startTime: string;
    responses: UserResponse[];
    status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
    riskScore?: any;
}

// Phase A: Behavioral Signals
export interface ResponseMetadata {
    questionId: string;
    timeTaken: number;
    changeCount: number;
    focusLostCount?: number;
}

// Phase B: Reliability Metrics
export interface ReliabilityMetrics {
    score: number; // 0.0 - 1.0
    consistencyScore: number;
    isSpeedRunning: boolean;
    patternStability: 'stable' | 'variable' | 'volatile';
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface SubmissionContext {
    tags: string[]; // e.g., 'late_night', 'exam_period'
    overallTime: number;
    platform: string;
}
// Phase B: Trend Analysis
export interface TrendAnalysis {
    trend: 'improving' | 'stable' | 'declining';
    riskEscalation: boolean;
    significantChanges: string[]; // e.g. "Sleep score dropped 20%"
    historyLength: number;
}
