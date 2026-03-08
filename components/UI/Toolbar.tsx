'use client'

import { useMapStore } from '@/store/mapStore'
import { useTracking } from '@/components/hooks/useTracking'

interface ToolbarProps {
  onOpenGPXModal: () => void
  onOpenHistory: () => void
  onCenterMap: () => void
}

export default function Toolbar({ onOpenGPXModal, onOpenHistory, onCenterMap }: ToolbarProps) {
  const { isAddingWaypoint, setIsAddingWaypoint } = useMapStore()
  const { isTracking, toggle: toggleTracking, exportTrack, pointCount } = useTracking()

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[101]"
      style={{ background: 'linear-gradient(0deg,rgba(10,13,15,.98) 70%,rgba(10,13,15,0) 100%)' }}
    >
      {/* Safe area padding for iPhone notch */}
      <div
        className="flex items-center justify-around gap-1 px-2 pt-2 pb-2"
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
      >
        {/* Track */}
        <ToolBtn
          active={isTracking}
          onClick={toggleTracking}
          label={isTracking ? 'Stop' : 'Lacak'}
          icon={
            isTracking ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                <rect x="5" y="5" width="14" height="14" rx="2" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
              </svg>
            )
          }
        />

        {/* GPX Import */}
        <ToolBtn
          onClick={onOpenGPXModal}
          label="GPX"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          }
        />

        {/* Export — only when track exists */}
        {pointCount > 0 && (
          <ToolBtn
            onClick={exportTrack}
            label="Export"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            }
          />
        )}

        {/* History */}
        <ToolBtn
          onClick={onOpenHistory}
          label="Riwayat"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
              <path d="M12 8v4l3 3" />
              <path d="M3.05 11a9 9 0 1 1 .5 4" />
              <polyline points="3 3 3 9 9 9" />
            </svg>
          }
        />

        {/* Waypoint */}
        <ToolBtn
          active={isAddingWaypoint}
          onClick={() => setIsAddingWaypoint(!isAddingWaypoint)}
          label="Waypoint"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          }
        />

        {/* Center on location */}
        <ToolBtn
          onClick={onCenterMap}
          label="Lokasi"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
              <circle cx="12" cy="12" r="10" />
              <line x1="22" y1="12" x2="18" y2="12" />
              <line x1="6" y1="12" x2="2" y2="12" />
              <line x1="12" y1="6" x2="12" y2="2" />
              <line x1="12" y1="22" x2="12" y2="18" />
            </svg>
          }
        />
      </div>
    </div>
  )
}

function ToolBtn({
  icon, label, onClick, active = false,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-xl border transition-all duration-200
        flex-1 min-w-0 py-2 px-1
        ${active
          ? 'bg-[#00e5a0]/10 border-[#00e5a0] text-[#00e5a0]'
          : 'bg-[#111518] border-[#1f2a32] text-[#607d8b] hover:border-[#00e5a0] hover:text-[#00e5a0]'
        }`}
    >
      {icon}
      <span className="text-[8px] sm:text-[9px] uppercase tracking-wide font-condensed font-semibold leading-none truncate w-full text-center">
        {label}
      </span>
    </button>
  )
}
