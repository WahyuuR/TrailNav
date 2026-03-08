'use client'

import { useRef, useState } from 'react'
import { useGPX } from '@/components/hooks/useGPX'

interface GPXModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GPXModal({ isOpen, onClose }: GPXModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { loadFile, loadDemo } = useGPX()

  if (!isOpen) return null

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.gpx')) {
      setError('Hanya file .gpx yang didukung')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await loadFile(file)
      onClose()
    } catch (e) {
      setError('Gagal memuat file GPX. Pastikan format valid.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleDemo = () => {
    loadDemo()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-[#111518] border border-[#1f2a32] rounded-2xl p-6 w-[min(400px,90vw)]">
        <h2 className="font-condensed text-2xl font-bold text-white mb-1">
          Muat Rute GPX
        </h2>
        <p className="text-sm text-[#607d8b] mb-5">
          Import file .gpx untuk menampilkan rute, waypoint, dan profil elevasi.
        </p>

        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 mb-4
            ${isDragging
              ? 'border-[#00e5a0] bg-[#00e5a0]/5'
              : 'border-[#1f2a32] hover:border-[#00e5a0] hover:bg-[#00e5a0]/5'
            }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="text-4xl mb-2">🗺️</div>
          <div className="font-condensed text-base text-[#607d8b] font-medium">
            {isLoading ? 'Memuat...' : 'Klik atau seret file .gpx ke sini'}
          </div>
          <div className="text-xs text-[#607d8b]/60 mt-1">
            Format: GPX 1.0 / 1.1 — dari Garmin, Strava, Wikiloc, dsb.
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".gpx"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />

        {error && (
          <div className="text-red-400 text-sm mb-3 px-1">{error}</div>
        )}

        {/* Demo button */}
        <button
          onClick={handleDemo}
          className="w-full py-3 rounded-xl bg-[#00e5a0] text-[#0a0d0f] font-condensed
            text-base font-bold tracking-wide hover:bg-[#00ffb3] transition-colors mb-2"
        >
          🏔️ Muat Rute Demo (Merapi)
        </button>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl border border-[#1f2a32] text-[#607d8b]
            font-condensed text-base font-semibold hover:border-[#607d8b] hover:text-white transition-colors"
        >
          Batal
        </button>
      </div>
    </div>
  )
}
