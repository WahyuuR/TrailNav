'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useMapStore } from '@/store/mapStore'
import { cumulativeDistances } from '@/lib/geo'

export default function ElevationChart() {
  const { gpxData, isTracking, trackPoints } = useMapStore()
  const [visible, setVisible] = useState(true)

  const points = gpxData?.trackPoints ?? (isTracking ? trackPoints : [])
  if (points.length < 2) return null

  const dists = cumulativeDistances(points)
  const totalDist = dists[dists.length - 1]

  const chartData = points.map((p, i) => ({
    dist: parseFloat((dists[i] / 1000).toFixed(2)),
    ele: Math.round(p.ele),
  }))

  const elevations = points.map((p) => p.ele)
  const maxEle = Math.round(Math.max(...elevations))
  const minEle = Math.round(Math.min(...elevations))
  const stats = gpxData?.stats
  const gain = stats?.elevationGain ?? 0
  const loss = stats?.elevationLoss ?? 0

  return (
    <div
      className="mx-2 sm:mx-3.5 bg-black/90 border border-[#1f2a32] rounded-xl backdrop-blur-md overflow-hidden"
      style={{ marginBottom: 'calc(56px + max(8px, env(safe-area-inset-bottom)))' }}
    >
      {/* Header — tappable to collapse */}
      <button
        onClick={() => setVisible(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2"
      >
        <span className="text-[9px] uppercase tracking-widest text-[#607d8b] font-condensed font-semibold">
          Profil Elevasi
        </span>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Key stats — always visible */}
          <span className="font-mono text-[9px] text-[#ffc857]">+{gain}m</span>
          <span className="font-mono text-[9px] text-[#ff6b35]">-{loss}m</span>
          <span className="font-mono text-[9px] text-[#607d8b]">
            {(totalDist / 1000).toFixed(2)}km
          </span>
          {/* Additional stats — hidden on very small */}
          <span className="font-mono text-[9px] text-[#607d8b] hidden sm:inline">
            ↑{maxEle}m ↓{minEle}m
          </span>
          <svg
            viewBox="0 0 16 16" fill="none" stroke="#607d8b" strokeWidth={2}
            className={`w-3 h-3 flex-shrink-0 transition-transform ${visible ? '' : 'rotate-180'}`}
          >
            <polyline points="4 6 8 10 12 6" />
          </svg>
        </div>
      </button>

      {/* Chart */}
      {visible && (
        <div className="px-1 pb-2">
          <ResponsiveContainer width="100%" height={64}>
            <AreaChart data={chartData} margin={{ top: 2, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e5a0" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00e5a0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="dist"
                tick={{ fontSize: 8, fill: '#607d8b', fontFamily: 'Space Mono' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}k`}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 8, fill: '#607d8b', fontFamily: 'Space Mono' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}`}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  background: '#111518', border: '1px solid #1f2a32',
                  borderRadius: 8, fontSize: 10, fontFamily: 'Space Mono', color: '#e8f0f4',
                  padding: '4px 10px',
                }}
                formatter={(value: number) => [`${value} m`, 'Elevasi']}
                labelFormatter={(label) => `${label} km`}
              />
              <Area
                type="monotone" dataKey="ele"
                stroke="#00e5a0" strokeWidth={1.5}
                fill="url(#elevGrad)" dot={false}
                activeDot={{ r: 3, fill: '#00e5a0', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
