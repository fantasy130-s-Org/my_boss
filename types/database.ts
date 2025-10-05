// Database types for MyBoss application

export type BossDimension = 'business' | 'leadership' | 'communication' | 'accountability' | 'care';

export type AnswerType = 'yes' | 'no' | 'unsure';

export interface Question {
  id: string;
  content: string;
  dimension: BossDimension;
  created_at: string;
  updated_at: string;
}

export interface DimensionScores {
  business: number;
  leadership: number;
  communication: number;
  accountability: number;
  care: number;
}

export interface Evaluation {
  id: string;
  boss_identifier: string | null;
  total_score: number;
  dimension_scores: DimensionScores;
  ai_evaluation: string | null;
  created_at: string;
}

export interface EvaluationAnswer {
  id: string;
  evaluation_id: string;
  question_id: string;
  answer: AnswerType;
  score: number;
  created_at: string;
}

// Extended type with question details for display
export interface EvaluationWithAnswers extends Evaluation {
  answers: (EvaluationAnswer & { question: Question })[];
}

// Dimension labels (Chinese)
export const DIMENSION_LABELS: Record<BossDimension, string> = {
  business: '业务水平',
  leadership: '指挥水平',
  communication: '沟通水平',
  accountability: '背锅水平',
  care: '关怀水平',
};

// Scoring constants
export const SCORING = {
  YES: 0,
  NO_MIN: 15,
  NO_MAX: 20,
  UNSURE_MIN: 5,
  UNSURE_MAX: 10,
  MAX_TOTAL: 100,
  MIN_TOTAL: 0,
} as const;
