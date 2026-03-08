'use client'

import { useMapStore } from '@/store/mapStore'
import { useTracking } from '@/components/hooks/useTracking'
import { useGPS } from '@/components/hooks/useGPS'

const GPS_LABEL: Record<string, string> = {
  off: 'GPS Off',
  searching: 'Mencari...',
  active: 'GPS Aktif',
  error: 'GPS Error',
}

const GPS_DOT_CLASS: Record<string, string> = {
  off: 'bg-[#607d8b]',
  searching: 'bg-[#ffc857] animate-pulse',
  active: 'bg-[#00e5a0] shadow-[0_0_8px_#00e5a0] animate-pulse',
  error: 'bg-red-500',
}

export default function TopBar() {
  const { gpsStatus } = useMapStore()
  const { isTracking, elapsedFormatted } = useTracking()
  const { getOnce } = useGPS()

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex items-center gap-2.5 px-3.5 py-2.5 pointer-events-none"
      style={{ background: 'linear-gradient(180deg,rgba(10,13,15,.98) 0%,rgba(10,13,15,0) 100%)' }}>

      {/* Logo */}
      <div className="font-mono font-bold text-lg text-[#00e5a0] tracking-tight pointer-events-auto"
        style={{ textShadow: '0 0 20px rgba(0,229,160,0.5)' }}>
        TRAIL<span className="text-[#607d8b] font-normal">NAV</span>
      </div>

      {/* Recording indicator */}
      {isTracking && (
        <div className="flex items-center gap-2 bg-[#ff6b35]/15 border border-[#ff6b35] rounded-full px-3.5 py-1 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-[#ff6b35] animate-pulse" />
          <span className="font-mono text-[11px] text-[#ff6b35]">{elapsedFormatted}</span>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* GPS chip */}
      <button
        onClick={getOnce}
        className="flex items-center gap-1.5 bg-[#111518] border border-[#1f2a32] rounded-full px-3 py-1.5
          text-[#607d8b] hover:border-[#00e5a0] hover:text-[#00e5a0] transition-all duration-200
          pointer-events-auto cursor-pointer"
      >
        <div className={`w-2 h-2 rounded-full transition-all ${GPS_DOT_CLASS[gpsStatus]}`} />
        <span className="font-mono text-[11px]">{GPS_LABEL[gpsStatus]}</span>
      </button>
    </div>
  )
}
