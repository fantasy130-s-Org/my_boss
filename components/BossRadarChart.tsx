'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { DimensionScores, DIMENSION_LABELS } from '@/types/database';

interface BossRadarChartProps {
  dimensionScores: DimensionScores;
}

export default function BossRadarChart({ dimensionScores }: BossRadarChartProps) {
  // Transform data for recharts
  const data = Object.entries(dimensionScores).map(([key, value]) => ({
    dimension: DIMENSION_LABELS[key as keyof DimensionScores],
    score: value,
    fullMark: 20,
  }));

  return (
    <div className="w-full h-[300px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: '#6b7280', fontSize: 12, dy: -8 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 20]}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <Radar
            name="老板水平"
            dataKey="score"
            stroke="#f97316"
            fill="#f97316"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
