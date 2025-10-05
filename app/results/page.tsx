import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import {
  calculateAnswerScore,
  calculateDimensionScores,
  calculateTotalScore,
} from '@/lib/scoring';
import { generateBossEvaluation } from '@/lib/openai';
import { BossDimension } from '@/types/database';
import ResultsDisplay from '@/components/ResultsDisplay';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ResultsPage({ searchParams }: PageProps) {
  const search = await searchParams;
  const supabase = await createClient();

  // Parse question IDs and answers from URL
  const questionIdsParam = search.questions;
  const answersParam = search.answers;

  if (
    !questionIdsParam ||
    typeof questionIdsParam !== 'string' ||
    !answersParam ||
    typeof answersParam !== 'string'
  ) {
    redirect('/');
  }

  const questionIds = questionIdsParam.split(',');
  const answerPairs = answersParam.split(',');

  if (questionIds.length !== 5 || answerPairs.length !== 5) {
    redirect('/');
  }

  // Fetch all questions
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .in('id', questionIds);

  if (questionsError || !questions || questions.length !== 5) {
    console.error('Error fetching questions:', questionsError);
    redirect('/');
  }

  // Parse answers and calculate scores
  const answersWithScores = answerPairs.map((pair) => {
    const [questionId, answer] = pair.split(':');
    const question = questions.find((q) => q.id === questionId);

    if (!question || !['yes', 'no', 'unsure'].includes(answer)) {
      throw new Error('Invalid question or answer');
    }

    const score = calculateAnswerScore(answer as 'yes' | 'no' | 'unsure');

    return {
      questionId,
      question: question.content,
      dimension: question.dimension as BossDimension,
      answer: answer as 'yes' | 'no' | 'unsure',
      score,
    };
  });

  // Calculate dimension and total scores
  const dimensionScores = calculateDimensionScores(
    answersWithScores.map(({ dimension, score }) => ({ dimension, score }))
  );
  const totalScore = calculateTotalScore(dimensionScores);

  // Generate AI evaluation
  const aiEvaluation = await generateBossEvaluation(totalScore, dimensionScores);

  // Calculate percentile
  const { data: percentileData } = await supabase.rpc('get_boss_percentile', {
    boss_score: totalScore,
  });
  const percentile = percentileData !== null ? percentileData : 50;

  // Save evaluation to database
  const { data: evaluation, error: evalError } = await supabase
    .from('evaluations')
    .insert({
      total_score: totalScore,
      dimension_scores: dimensionScores,
      ai_evaluation: aiEvaluation,
    })
    .select()
    .single();

  if (!evalError && evaluation) {
    // Save individual answers
    const answersToInsert = answersWithScores.map(({ questionId, answer, score }) => ({
      evaluation_id: evaluation.id,
      question_id: questionId,
      answer,
      score,
    }));

    await supabase.from('evaluation_answers').insert(answersToInsert);
  }

  return (
    <ResultsDisplay
      totalScore={totalScore}
      dimensionScores={dimensionScores}
      aiEvaluation={aiEvaluation}
      percentile={percentile}
      evaluationId={evaluation?.id}
    />
  );
}
