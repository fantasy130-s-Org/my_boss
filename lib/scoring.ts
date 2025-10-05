import { AnswerType, BossDimension, DimensionScores, SCORING } from '@/types/database';

/**
 * Calculate score for a single answer
 * - yes: 0 points
 * - no: random 15-20 points
 * - unsure: random 5-10 points
 */
export function calculateAnswerScore(answer: AnswerType): number {
  switch (answer) {
    case 'yes':
      return SCORING.YES;
    case 'no':
      return randomInt(SCORING.NO_MIN, SCORING.NO_MAX);
    case 'unsure':
      return randomInt(SCORING.UNSURE_MIN, SCORING.UNSURE_MAX);
    default:
      return 0;
  }
}

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculate dimension scores from answers
 */
export function calculateDimensionScores(
  answers: Array<{ dimension: BossDimension; score: number }>
): DimensionScores {
  const scores: DimensionScores = {
    business: 0,
    leadership: 0,
    communication: 0,
    accountability: 0,
    care: 0,
  };

  // Sum up scores by dimension
  answers.forEach(({ dimension, score }) => {
    scores[dimension] += score;
  });

  return scores;
}

/**
 * Calculate total score from dimension scores
 */
export function calculateTotalScore(dimensionScores: DimensionScores): number {
  return Object.values(dimensionScores).reduce((sum, score) => sum + score, 0);
}

/**
 * Get performance label based on score
 */
export function getScoreLabel(score: number): string {
  if (score >= 80) return '优秀老板';
  if (score >= 60) return '合格老板';
  if (score >= 40) return '一般老板';
  if (score >= 20) return '较差老板';
  return '极品老板';
}

/**
 * Get dimension performance label
 */
export function getDimensionLabel(score: number): string {
  if (score >= 16) return '优秀';
  if (score >= 12) return '良好';
  if (score >= 8) return '一般';
  if (score >= 4) return '较差';
  return '极差';
}
