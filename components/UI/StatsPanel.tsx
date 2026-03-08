'use client'

import { useState } from 'react'
import { useMapStore } from '@/store/mapStore'
import { useTracking } from '@/components/hooks/useTracking'
import { formatCoordDMS } from '@/lib/geo'

export default function StatsPanel() {
  const { currentGPS, gpxData } = useMapStore()
  const { isTracking, elapsedFormatted, trackDistance, elevationGain, elevationLoss } = useTracking()
  const [collapsed, setCollapsed] = useState(false)

  const gps = currentGPS
  const gpxStats = gpxData?.stats

  const displayDist = isTracking ? trackDistance : (gpxStats?.totalDistance ?? 0)
  const displayGain = isTracking ? elevationGain : (gpxStats?.elevationGain ?? 0)
  const displayLoss = isTracking ? elevationLoss : (gpxStats?.elevationLoss ?? 0)

  return (
    <div className="bg-black/90 border border-[#1f2a32] rounded-xl backdrop-blur-md overflow-hidden"
      style={{ width: 'min(192px, calc(100vw - 70px))' }}>

      {/* ── Header (always visible) — tap to collapse on mobile ── */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-3 py-2.5 cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* GPS status dot */}
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            gps ? 'bg-[#00e5a0] shadow-[0_0_6px_#00e5a0]' : 'bg-[#607d8b]'
          }`} />
          {/* Elevation — always visible */}
          <span className="font-mono text-[13px] font-bold text-[#00e5a0] truncate">
            {gps ? `${Math.round(gps.ele)} m` : '— m'}
          </span>
        </div>
        {/* Collapse chevron */}
        <svg
          viewBox="0 0 16 16" fill="none" stroke="#607d8b" strokeWidth={2}
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
        >
          <polyline points="4 6 8 10 12 6" />
        </svg>
      </button>

      {/* ── Expanded content ── */}
      {!collapsed && (
        <div className="px-3 pb-3 space-y-0">

          {/* Coordinates */}
          <div className="mb-2">
            <div className="text-[9px] uppercase tracking-widest text-[#607d8b] font-condensed font-semibold mb-1">
              Koordinat
            </div>
            <div className="font-mono text-[10px] text-[#00b8d4] leading-[1.6]">
              {gps ? formatCoordDMS(gps.lat, 'lat') : '—'}
            </div>
            <div className="font-mono text-[10px] text-[#00b8d4]">
              {gps ? formatCoordDMS(gps.lon, 'lon') : '—'}
            </div>
          </div>

          <div className="h-px bg-[#1f2a32] my-2" />

          <StatRow label="Akurasi" value={gps ? `±${gps.accuracy}` : '—'} unit="m" />

          <div className="h-px bg-[#1f2a32] my-2" />

          <StatRow label="Jarak" value={displayDist > 0 ? (displayDist / 1000).toFixed(2) : '0.00'} unit="km" color="text-[#00b8d4]" />
          <StatRow label="Naik ↑" value={`${displayGain || 0}`} unit="m" color="text-[#ffc857]" />
          <StatRow label="Turun ↓" value={`${displayLoss || 0}`} unit="m" color="text-[#ff6b35]" />
          <StatRow
            label="Durasi"
            value={isTracking ? elapsedFormatted : (gpxStats?.duration ? formatSeconds(gpxStats.duration) : '—')}
          />
          <StatRow label="Kecepatan" value={gps ? `${gps.speed.toFixed(1)}` : '0.0'} unit="km/h" />
        </div>
      )}
    </div>
  )
}

function StatRow({ label, value, unit, color = 'text-white' }: {
  label: string; value: string; unit?: string; color?: string
}) {
  return (
    <div className="flex justify-between items-baseline py-0.5">
      <span className="text-[9px] uppercase tracking-wide text-[#607d8b] font-condensed font-medium">
        {label}
      </span>
      <span className={`font-mono text-[12px] font-bold ${color}`}>
        {value}
        {unit && <span className="text-[9px] text-[#607d8b] font-normal ml-0.5">{unit}</span>}
      </span>
    </div>
  )
}

function formatSeconds(s: number): string {
  const h = Math.floor(s / 3600).toString().padStart(2, '0')
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
  return `${h}:${m}`
}
