'use client';

import { useState, useRef } from 'react';
import { DimensionScores, DIMENSION_LABELS } from '@/types/database';
import { getScoreLabel } from '@/lib/scoring';
import BossRadarChart from './BossRadarChart';
import Link from 'next/link';
import { toPng } from 'html-to-image';

interface ResultsDisplayProps {
  totalScore: number;
  dimensionScores: DimensionScores;
  aiEvaluation: string;
  percentile: number;
  evaluationId?: string;
}

export default function ResultsDisplay({
  totalScore,
  dimensionScores,
  aiEvaluation,
  percentile,
  evaluationId,
}: ResultsDisplayProps) {
  const [showBossIdentifier, setShowBossIdentifier] = useState(false);
  const [bossIdentifier, setBossIdentifier] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const handleSaveBossIdentifier = async () => {
    if (!bossIdentifier.trim() || !evaluationId) return;

    setSaving(true);
    try {
      const response = await fetch('/api/update-boss-identifier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationId,
          bossIdentifier: bossIdentifier.trim(),
        }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setShowBossIdentifier(false), 2000);
      }
    } catch (error) {
      console.error('Error saving boss identifier:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!shareCardRef.current) return;

    setDownloading(true);
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `我的老板检测结果-${totalScore}分.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      alert('图片生成失败，请稍后重试');
    } finally {
      setDownloading(false);
    }
  };

  const scoreLabel = getScoreLabel(totalScore);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">检测结果</h1>
          <p className="text-gray-600">你的老板水平报告</p>
        </div>

        {/* Share Card (for image generation) */}
        <div ref={shareCardRef} className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center">
            <div className="mb-4">
              <div className="text-6xl font-bold text-orange-600 mb-2">
                {totalScore}
                <span className="text-3xl text-gray-500">/100</span>
              </div>
              <div className="text-2xl font-semibold text-gray-700">{scoreLabel}</div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 mb-6">
              <p className="text-gray-700">
                你的老板被全国{' '}
                <span className="text-2xl font-bold text-orange-600">{Math.round(100 - percentile)}%</span>{' '}
                的老板打败
              </p>
            </div>

            {/* AI Evaluation */}
            <div className="bg-gray-50 rounded-lg p-6 text-left mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">🤖</span>
                AI 智能评价
              </h3>
              <p className="text-gray-700 leading-relaxed">{aiEvaluation}</p>
            </div>

            {/* Radar Chart */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                五维能力雷达图
              </h3>
              <BossRadarChart dimensionScores={dimensionScores} />
            </div>

            {/* Dimension Details */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(dimensionScores).map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">
                      {DIMENSION_LABELS[key as keyof DimensionScores]}
                    </span>
                    <span className="text-orange-600 font-bold">
                      {value}
                      <span className="text-sm text-gray-500">/20</span>
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${(value / 20) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="space-y-4">
            <button
              onClick={handleDownloadImage}
              disabled={downloading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:bg-gray-400"
            >
              {downloading ? '生成中...' : '📥 下载结果图片'}
            </button>

            {!showBossIdentifier ? (
              <button
                onClick={() => setShowBossIdentifier(true)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                保存老板标识（可选）
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={bossIdentifier}
                  onChange={(e) => setBossIdentifier(e.target.value)}
                  placeholder="输入老板姓名、花名、电话等"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveBossIdentifier}
                    disabled={saving || saved}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      saved
                        ? 'bg-green-500 text-white'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {saved ? '已保存 ✓' : saving ? '保存中...' : '确定'}
                  </button>
                  <button
                    onClick={() => setShowBossIdentifier(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            <Link
              href="/"
              className="block w-full bg-gray-800 hover:bg-gray-900 text-white text-center py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>可以在首页搜索框查询老板的历史检测记录</p>
        </div>
      </div>
    </div>
  );
}
