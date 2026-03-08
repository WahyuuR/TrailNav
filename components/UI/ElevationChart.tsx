'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { useMapStore } from '@/store/mapStore'
import { cumulativeDistances } from '@/lib/geo'

export default function ElevationChart() {
  const { gpxData, isTracking, trackPoints } = useMapStore()

  // Use GPX data or live track points
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
    <div className="mx-3.5 mb-[72px] bg-black/90 border border-[#1f2a32] rounded-xl p-3 pb-2 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest text-[#607d8b] font-condensed font-semibold">
          Profil Elevasi
        </span>
        <div className="flex gap-3">
          <span className="font-mono text-[10px] text-[#607d8b]">
            ↑ <span className="text-white">{maxEle}</span>m
          </span>
          <span className="font-mono text-[10px] text-[#607d8b]">
            ↓ <span className="text-white">{minEle}</span>m
          </span>
          <span className="font-mono text-[10px] text-[#607d8b]">
            ∑ <span className="text-white">{(totalDist / 1000).toFixed(2)}</span>km
          </span>
          <span className="font-mono text-[10px] text-[#ffc857]">
            +{gain}m
          </span>
          <span className="font-mono text-[10px] text-[#ff6b35]">
            -{loss}m
          </span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={72}>
        <AreaChart data={chartData} margin={{ top: 2, right: 0, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00e5a0" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#00e5a0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="dist"
            tick={{ fontSize: 9, fill: '#607d8b', fontFamily: 'Space Mono' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}km`}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 9, fill: '#607d8b', fontFamily: 'Space Mono' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}m`}
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: '#111518',
              border: '1px solid #1f2a32',
              borderRadius: 8,
              fontSize: 11,
              fontFamily: 'Space Mono',
              color: '#e8f0f4',
            }}
            formatter={(value: number) => [`${value} m`, 'Elevasi']}
            labelFormatter={(label) => `${label} km`}
          />
          <Area
            type="monotone"
            dataKey="ele"
            stroke="#00e5a0"
            strokeWidth={1.5}
            fill="url(#elevGrad)"
            dot={false}
            activeDot={{ r: 3, fill: '#00e5a0', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
