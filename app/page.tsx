'use client'

import { useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useMapStore } from '@/store/mapStore'
import { useGPS } from '@/components/hooks/useGPS'
import type { MapHandle } from '@/components/Map/MapContainer'
import type { MapLayer } from '@/types'

import TopBar from '@/components/UI/TopBar'
import StatsPanel from '@/components/UI/StatsPanel'
import Toolbar from '@/components/UI/Toolbar'
import ElevationChart from '@/components/UI/ElevationChart'
import GPXModal from '@/components/UI/GPXModal'
import LayerSwitcher from '@/components/UI/LayerSwitcher'

// Dynamic import — Leaflet requires browser APIs (no SSR)
const MapContainer = dynamic(() => import('@/components/Map/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-[#0a0d0f] flex items-center justify-center">
      <div className="text-center">
        <div className="font-mono text-[#00e5a0] text-2xl font-bold mb-2">TRAILNAV</div>
        <div className="text-[#607d8b] text-sm">Memuat peta...</div>
      </div>
    </div>
  ),
})

export default function Home() {
  const mapRef = useRef<MapHandle>(null)
  const [gpxModalOpen, setGPXModalOpen] = useState(false)
  const { setActiveLayer } = useMapStore()
  const { startWatch } = useGPS()

  const handleCenterMap = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.centerOnLocation()
    } else {
      startWatch()
    }
  }, [startWatch])

  const handleLayerChange = useCallback((layer: MapLayer) => {
    setActiveLayer(layer)
  }, [setActiveLayer])

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {/* ── Map (base layer) ── */}
      <MapContainer ref={mapRef} />

      {/* ── Top bar ── */}
      <TopBar />

      {/* ── Left panel: stats ── */}
      <div className="fixed top-[60px] left-3.5 z-[100] pointer-events-none">
        <div className="pointer-events-auto">
          <StatsPanel />
        </div>
      </div>

      {/* ── Right panel: map controls ── */}
      <div className="fixed top-[60px] right-3.5 z-[100] flex flex-col gap-2.5 pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-2.5">
          <LayerSwitcher onLayerChange={handleLayerChange} />
          <MapZoomBtn onClick={() => mapRef.current?.getMap()?.zoomIn()} label="+" />
          <MapZoomBtn onClick={() => mapRef.current?.getMap()?.zoomOut()} label="−" />
        </div>
      </div>

      {/* ── Elevation chart ── */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-none">
        <div className="pointer-events-auto">
          <ElevationChart />
        </div>
      </div>

      {/* ── Bottom toolbar ── */}
      <Toolbar
        onOpenGPXModal={() => setGPXModalOpen(true)}
        onCenterMap={handleCenterMap}
      />

      {/* ── GPX modal ── */}
      <GPXModal
        isOpen={gpxModalOpen}
        onClose={() => setGPXModalOpen(false)}
      />
    </main>
  )
}

function MapZoomBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="w-[42px] h-[42px] rounded-xl bg-black/90 border border-[#1f2a32] text-[#607d8b]
        flex items-center justify-center text-xl font-mono backdrop-blur-md
        hover:border-[#00e5a0] hover:text-[#00e5a0] transition-all duration-200"
    >
      {label}
    </button>
  )
}
