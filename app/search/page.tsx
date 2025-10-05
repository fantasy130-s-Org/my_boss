import { createClient } from '@/utils/supabase/server';
import { DIMENSION_LABELS, DimensionScores } from '@/types/database';
import { getScoreLabel } from '@/lib/scoring';
import BossRadarChart from '@/components/BossRadarChart';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const search = await searchParams;
  const query = search.q;

  if (!query || typeof query !== 'string') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-4">请输入老板标识进行搜索</p>
            <Link
              href="/"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-lg font-semibold transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const supabase = await createClient();

  // Search for evaluations with matching boss identifier
  const { data: evaluations, error } = await supabase
    .from('evaluations')
    .select('*')
    .ilike('boss_identifier', `%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching evaluations:', error);
  }

  const hasResults = evaluations && evaluations.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4"
          >
            <span className="mr-2">←</span>
            返回首页
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">搜索结果</h1>
          <p className="text-gray-600">
            关键词: <span className="font-semibold">{query}</span>
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <form action="/search" method="GET" className="flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="输入老板标识"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              搜索
            </button>
          </form>
        </div>

        {/* Results */}
        {!hasResults ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              未找到相关记录
            </h2>
            <p className="text-gray-600 mb-6">
              没有找到与 &quot;{query}&quot; 相关的老板检测记录
            </p>
            <Link
              href="/questionnaire/1"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              开始新检测
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-gray-700">
                找到 <span className="font-bold text-orange-600">{evaluations.length}</span>{' '}
                条检测记录
              </p>
            </div>

            {evaluations.map((evaluation) => {
              const dimensionScores = evaluation.dimension_scores as DimensionScores;
              const scoreLabel = getScoreLabel(evaluation.total_score);
              const date = new Date(evaluation.created_at).toLocaleDateString('zh-CN');

              // Calculate percentile for this evaluation
              return (
                <div
                  key={evaluation.id}
                  className="bg-white rounded-lg shadow-lg p-6"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        检测日期: {date}
                      </div>
                      <div className="text-3xl font-bold text-orange-600">
                        {evaluation.total_score}
                        <span className="text-lg text-gray-500">/100</span>
                      </div>
                      <div className="text-lg font-semibold text-gray-700">
                        {scoreLabel}
                      </div>
                    </div>
                  </div>

                  {/* AI Evaluation */}
                  {evaluation.ai_evaluation && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <span className="mr-1">🤖</span>
                        AI 评价
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {evaluation.ai_evaluation}
                      </p>
                    </div>
                  )}

                  {/* Radar Chart */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      五维能力雷达图
                    </h4>
                    <div className="h-[300px]">
                      <BossRadarChart dimensionScores={dimensionScores} />
                    </div>
                  </div>

                  {/* Dimension Scores */}
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(dimensionScores).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">
                            {DIMENSION_LABELS[key as keyof DimensionScores]}
                          </span>
                          <span className="text-sm font-bold text-orange-600">
                            {value}/20
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-orange-500 h-1.5 rounded-full"
                            style={{ width: `${(value / 20) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
