'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface QuestionnaireFormProps {
  currentStep: number;
  questionIds: string[];
  questionId: string;
  currentAnswer?: string;
  answers: Record<string, string>;
}

export default function QuestionnaireForm({
  currentStep,
  questionIds,
  questionId,
  currentAnswer,
  answers,
}: QuestionnaireFormProps) {
  const router = useRouter();
  const [selectedAnswer, setSelectedAnswer] = useState<string>(currentAnswer || '');

  const handleAnswerChange = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const buildUrl = (step: number, newAnswer?: string) => {
    const updatedAnswers = { ...answers };
    if (newAnswer) {
      updatedAnswers[questionId] = newAnswer;
    }

    const answersStr = Object.entries(updatedAnswers)
      .map(([qId, ans]) => `${qId}:${ans}`)
      .join(',');

    const questionsStr = questionIds.join(',');

    return `/questionnaire/${step}?questions=${questionsStr}&answers=${answersStr}`;
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      router.push(buildUrl(currentStep - 1));
    }
  };

  const handleNext = () => {
    if (!selectedAnswer) {
      alert('请选择一个答案');
      return;
    }

    if (currentStep < 5) {
      router.push(buildUrl(currentStep + 1, selectedAnswer));
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer) {
      alert('请选择一个答案');
      return;
    }

    // Update answers with current selection
    const finalAnswers = { ...answers, [questionId]: selectedAnswer };

    // Build query string for results page
    const answersStr = Object.entries(finalAnswers)
      .map(([qId, ans]) => `${qId}:${ans}`)
      .join(',');
    const questionsStr = questionIds.join(',');

    router.push(`/results?questions=${questionsStr}&answers=${answersStr}`);
  };

  const answerOptions = [
    { value: 'yes', label: '是', color: 'bg-red-500 hover:bg-red-600' },
    { value: 'unsure', label: '难说', color: 'bg-yellow-500 hover:bg-yellow-600' },
    { value: 'no', label: '否', color: 'bg-green-500 hover:bg-green-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Answer Options */}
      <div className="space-y-3">
        {answerOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleAnswerChange(option.value)}
            className={`w-full py-4 px-6 rounded-lg text-white font-semibold text-lg transition-all ${
              selectedAnswer === option.value
                ? `${option.color} ring-4 ring-offset-2 ring-orange-300`
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        {currentStep > 1 && (
          <button
            onClick={handlePrevious}
            className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            上一题
          </button>
        )}

        {currentStep < 5 ? (
          <button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
              selectedAnswer
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            下一题
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
              selectedAnswer
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            提交
          </button>
        )}
      </div>
    </div>
  );
}
