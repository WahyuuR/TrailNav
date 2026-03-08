'use client'

import { useMapStore } from '@/store/mapStore'
import { useTracking } from '@/components/hooks/useTracking'
import { formatCoordDMS, formatDistance } from '@/lib/geo'

export default function StatsPanel() {
  const { currentGPS, gpxData } = useMapStore()
  const { isTracking, elapsedFormatted, trackDistance, elevationGain, elevationLoss } =
    useTracking()

  const gps = currentGPS
  const gpxStats = gpxData?.stats

  // Use GPX stats when not tracking, track stats when tracking
  const displayDist = isTracking ? trackDistance : (gpxStats?.totalDistance ?? 0)
  const displayGain = isTracking ? elevationGain : (gpxStats?.elevationGain ?? 0)
  const displayLoss = isTracking ? elevationLoss : (gpxStats?.elevationLoss ?? 0)

  return (
    <div className="bg-black/90 border border-[#1f2a32] rounded-xl p-3.5 w-[200px] backdrop-blur-md">
      {/* Coordinates */}
      <div className="mb-2">
        <div className="text-[10px] uppercase tracking-widest text-[#607d8b] font-condensed font-semibold mb-1">
          Koordinat
        </div>
        <div className="font-mono text-[11px] text-[#00b8d4] leading-5">
          {gps ? formatCoordDMS(gps.lat, 'lat') : '—'}
        </div>
        <div className="font-mono text-[11px] text-[#00b8d4]">
          {gps ? formatCoordDMS(gps.lon, 'lon') : '—'}
        </div>
      </div>

      <div className="h-px bg-[#1f2a32] my-2.5" />

      {/* Elevation & Accuracy */}
      <StatRow
        label="Elevasi"
        value={gps ? `${Math.round(gps.ele)}` : '—'}
        unit="m"
        color="text-[#00e5a0]"
      />
      <StatRow
        label="Akurasi GPS"
        value={gps ? `±${gps.accuracy}` : '—'}
        unit="m"
        color="text-white"
      />

      <div className="h-px bg-[#1f2a32] my-2.5" />

      {/* Track stats */}
      <StatRow
        label="Jarak Tempuh"
        value={displayDist > 0 ? (displayDist / 1000).toFixed(2) : '0.00'}
        unit="km"
        color="text-[#00b8d4]"
      />
      <StatRow
        label="Naik ↑"
        value={displayGain > 0 ? `${displayGain}` : '0'}
        unit="m"
        color="text-[#ffc857]"
      />
      <StatRow
        label="Turun ↓"
        value={displayLoss > 0 ? `${displayLoss}` : '0'}
        unit="m"
        color="text-[#ff6b35]"
      />
      <StatRow
        label="Durasi"
        value={isTracking ? elapsedFormatted : (gpxStats?.duration ? formatSeconds(gpxStats.duration) : '—')}
        color="text-white"
      />
      <StatRow
        label="Kecepatan"
        value={gps ? `${gps.speed.toFixed(1)}` : '0.0'}
        unit="km/h"
        color="text-white"
      />
    </div>
  )
}

function StatRow({
  label,
  value,
  unit,
  color = 'text-white',
}: {
  label: string
  value: string
  unit?: string
  color?: string
}) {
  return (
    <div className="flex justify-between items-baseline mb-2 last:mb-0">
      <span className="text-[10px] uppercase tracking-wide text-[#607d8b] font-condensed font-medium">
        {label}
      </span>
      <span className={`font-mono text-[13px] font-bold ${color}`}>
        {value}
        {unit && <span className="text-[10px] text-[#607d8b] font-normal ml-0.5">{unit}</span>}
      </span>
    </div>
  )
}

function formatSeconds(s: number): string {
  const h = Math.floor(s / 3600).toString().padStart(2, '0')
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
  return `${h}:${m}`
}
