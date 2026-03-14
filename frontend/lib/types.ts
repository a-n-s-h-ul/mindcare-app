
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

export interface SurveyResponse {
    sessionId: string;
    question: Question;
}

export interface SurveyResult {
    riskLevel: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
    explanation: {
        title: string;
        summary: string;
        factors: { domain: string; description: string }[];
        nextSteps: string[];
        resources: { name?: string; title?: string; phone?: string; contact?: string; hours?: string }[];
    };
}
