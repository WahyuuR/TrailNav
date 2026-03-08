'use client'

import { useState } from 'react'
import { useMapStore } from '@/store/mapStore'
import { LAYER_CONFIGS } from '@/lib/layers'
import type { MapLayer } from '@/types'

interface LayerSwitcherProps {
  onLayerChange: (layer: MapLayer) => void
}

export default function LayerSwitcher({ onLayerChange }: LayerSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { activeLayer, setActiveLayer } = useMapStore()

  const handleSelect = (id: MapLayer) => {
    setActiveLayer(id)
    onLayerChange(id)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-[42px] h-[42px] rounded-xl border flex items-center justify-center transition-all duration-200
          backdrop-blur-md cursor-pointer
          ${isOpen
            ? 'bg-[#00e5a0]/10 border-[#00e5a0] text-[#00e5a0]'
            : 'bg-black/90 border-[#1f2a32] text-[#607d8b] hover:border-[#00e5a0] hover:text-[#00e5a0]'
          }`}
        title="Layer Peta"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
          <polygon points="3 6 12 3 21 6 12 9" />
          <polyline points="3 10 12 13 21 10" />
          <polyline points="3 14 12 17 21 14" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          {/* Panel */}
          <div className="absolute top-0 right-12 z-20 bg-[#111518] border border-[#1f2a32] rounded-xl p-2 w-44 shadow-2xl">
            <div className="text-[10px] uppercase tracking-widest text-[#607d8b] px-2 py-1.5 font-condensed font-semibold">
              Layer Peta
            </div>
            {LAYER_CONFIGS.map((cfg) => (
              <button
                key={cfg.id}
                onClick={() => handleSelect(cfg.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors
                  ${activeLayer === cfg.id
                    ? 'text-[#00e5a0]'
                    : 'text-[#607d8b] hover:bg-[#181d22] hover:text-white'
                  }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ background: cfg.color }}
                />
                {cfg.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
