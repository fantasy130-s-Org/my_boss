import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export default async function Home() {
  const supabase = await createClient();

  // Get total number of evaluations for display
  const { count } = await supabase
    .from('evaluations')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-orange-600 mb-4">
            我的老板
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            老板水平检测器
          </p>
          <p className="text-sm text-gray-500">
            已有 {count || 0} 位打工人完成检测
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                功能介绍
              </h2>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">📝</span>
                  <span>5道题快速检测老板水平</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">📊</span>
                  <span>AI智能分析，生成专业评价</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">🎯</span>
                  <span>五维雷达图，全方位评估</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">🔍</span>
                  <span>搜索查看你老板的历史记录</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">📤</span>
                  <span>生成图片，分享到朋友圈</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <Link
                href="/questionnaire/1"
                className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-4 px-6 rounded-lg font-semibold text-lg transition-colors"
              >
                开始检测
              </Link>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            查老板
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            输入老板标识（姓名、花名、微信名、电话等）查看TA的历史检测结果
          </p>
          <form action="/search" method="GET" className="flex gap-2">
            <input
              type="text"
              name="q"
              placeholder="输入老板标识"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <button
              type="submit"
              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              搜索
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>轻松一测，了解你的老板</p>
          <p className="mt-1">仅供娱乐，请尽情对号入座 😄</p>
        </div>
      </div>
    </div>
  );
}
