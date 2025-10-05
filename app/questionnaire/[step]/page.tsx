import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import QuestionnaireForm from '@/components/QuestionnaireForm';

interface PageProps {
  params: Promise<{ step: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function QuestionnairePage({ params, searchParams }: PageProps) {
  const { step } = await params;
  const search = await searchParams;

  const currentStep = parseInt(step);

  // Validate step
  if (isNaN(currentStep) || currentStep < 1 || currentStep > 5) {
    redirect('/questionnaire/1');
  }

  const supabase = await createClient();

  // Get or generate question IDs
  let questionIds: string[] = [];
  const questionIdsParam = search.questions;

  if (questionIdsParam && typeof questionIdsParam === 'string') {
    questionIds = questionIdsParam.split(',');
  } else if (currentStep === 1) {
    // Generate new set of questions using the database function
    const { data, error } = await supabase.rpc('get_random_questions');

    if (error) {
      console.error('Error fetching questions:', error);
      return <div>Error loading questions</div>;
    }

    questionIds = data.map((q: { id: string }) => q.id);
  } else {
    // No questions in URL and not step 1, redirect to start
    redirect('/questionnaire/1');
  }

  // Fetch the current question
  const currentQuestionId = questionIds[currentStep - 1];
  const { data: question, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', currentQuestionId)
    .single();

  if (error || !question) {
    console.error('Error fetching question:', error);
    return <div>Error loading question</div>;
  }

  // Get answers from URL params
  const answersParam = search.answers;
  const answers: Record<string, string> = {};
  if (answersParam && typeof answersParam === 'string') {
    const answerPairs = answersParam.split(',');
    answerPairs.forEach((pair) => {
      const [qId, answer] = pair.split(':');
      if (qId && answer) {
        answers[qId] = answer;
      }
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">问题 {currentStep}/5</span>
            <span className="text-sm text-gray-600">{currentStep * 20}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${currentStep * 20}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {question.content}
          </h2>

          <QuestionnaireForm
            currentStep={currentStep}
            questionIds={questionIds}
            questionId={question.id}
            currentAnswer={answers[question.id]}
            answers={answers}
          />
        </div>

        {/* Helper Text */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>根据你的真实感受选择答案</p>
        </div>
      </div>
    </div>
  );
}
