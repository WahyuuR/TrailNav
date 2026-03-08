'use client'

import { useState, useEffect, useRef } from 'react'
import { useMapStore } from '@/store/mapStore'
import { useTrackHistory } from '@/components/hooks/useTrackHistory'
import { type SavedTrack } from '@/lib/trackDB'
import { formatDistance, formatDuration } from '@/lib/geo'
import type { GPXData } from '@/types'

interface TrackHistoryPanelProps {
  isOpen: boolean
  onClose: () => void
  onLoadTrack: (data: GPXData) => void
}

export default function TrackHistoryPanel({ isOpen, onClose, onLoadTrack }: TrackHistoryPanelProps) {
  const { tracks, isLoading, remove, rename } = useTrackHistory()
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingId])

  if (!isOpen) return null

  const handleLoad = (track: SavedTrack) => {
    const gpxData: GPXData = {
      name: track.name,
      trackPoints: track.points,
      waypoints: track.waypoints,
      stats: track.stats,
    }
    onLoadTrack(gpxData)
    onClose()
  }

  const handleRenameStart = (track: SavedTrack) => {
    setRenamingId(track.id)
    setRenameValue(track.name)
  }

  const handleRenameSubmit = async (id: string) => {
    if (renameValue.trim()) await rename(id, renameValue.trim())
    setRenamingId(null)
  }

  const handleDelete = async (id: string) => {
    await remove(id)
    setConfirmDeleteId(null)
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-[#111518] border border-[#1f2a32] rounded-t-2xl sm:rounded-2xl w-full sm:w-[480px] flex flex-col" style={{ maxHeight: "80dvh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f2a32] flex-shrink-0">
          <div>
            <h2 className="font-condensed text-xl font-bold text-white">Riwayat Track</h2>
            <p className="text-xs text-[#607d8b] mt-0.5">
              {tracks.length} track tersimpan di perangkat ini
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#181d22] border border-[#1f2a32] flex items-center justify-center
              text-[#607d8b] hover:text-white hover:border-[#607d8b] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-3 space-y-2">
          {isLoading ? (
            <div className="text-center py-12 text-[#607d8b] text-sm">Memuat...</div>
          ) : tracks.length === 0 ? (
            <EmptyState />
          ) : (
            tracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                isRenaming={renamingId === track.id}
                renameValue={renameValue}
                renameInputRef={renamingId === track.id ? renameInputRef : undefined}
                confirmingDelete={confirmDeleteId === track.id}
                onLoad={() => handleLoad(track)}
                onRenameStart={() => handleRenameStart(track)}
                onRenameChange={setRenameValue}
                onRenameSubmit={() => handleRenameSubmit(track.id)}
                onRenameCancel={() => setRenamingId(null)}
                onDeleteRequest={() => setConfirmDeleteId(track.id)}
                onDeleteConfirm={() => handleDelete(track.id)}
                onDeleteCancel={() => setConfirmDeleteId(null)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Track Card ───────────────────────────────────────────────

function TrackCard({
  track,
  isRenaming,
  renameValue,
  renameInputRef,
  confirmingDelete,
  onLoad,
  onRenameStart,
  onRenameChange,
  onRenameSubmit,
  onRenameCancel,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: {
  track: SavedTrack
  isRenaming: boolean
  renameValue: string
  renameInputRef?: React.RefObject<HTMLInputElement>
  confirmingDelete: boolean
  onLoad: () => void
  onRenameStart: () => void
  onRenameChange: (v: string) => void
  onRenameSubmit: () => void
  onRenameCancel: () => void
  onDeleteRequest: () => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}) {
  const { stats, date, points, previewColor } = track
  const dateObj = new Date(date)
  const dateStr = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="bg-[#181d22] border border-[#1f2a32] rounded-xl overflow-hidden hover:border-[#2a3a44] transition-colors">
      <div className="flex gap-3 p-3">
        {/* Mini map preview */}
        <div className="flex-shrink-0">
          <MiniMapPreview points={points} color={previewColor} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          {isRenaming ? (
            <div className="flex gap-1.5 mb-1.5">
              <input
                ref={renameInputRef}
                value={renameValue}
                onChange={(e) => onRenameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onRenameSubmit()
                  if (e.key === 'Escape') onRenameCancel()
                }}
                className="flex-1 bg-[#111518] border border-[#00e5a0] rounded-lg px-2.5 py-1
                  text-sm text-white font-condensed font-semibold outline-none min-w-0"
              />
              <button onClick={onRenameSubmit}
                className="px-2.5 py-1 bg-[#00e5a0] text-[#0a0d0f] rounded-lg text-xs font-bold font-condensed">
                ✓
              </button>
              <button onClick={onRenameCancel}
                className="px-2.5 py-1 bg-[#181d22] border border-[#1f2a32] text-[#607d8b] rounded-lg text-xs font-condensed">
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-condensed font-semibold text-white text-[15px] truncate">
                {track.name}
              </span>
              <button onClick={onRenameStart} className="text-[#607d8b] hover:text-[#00b8d4] transition-colors flex-shrink-0">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                  <path d="M11.5 2.5l2 2L5 13l-2.5.5.5-2.5L11.5 2.5z"/>
                </svg>
              </button>
            </div>
          )}

          {/* Date */}
          <div className="text-[11px] text-[#607d8b] mb-2">
            {dateStr} · {timeStr}
          </div>

          {/* Stats row */}
          <div className="flex gap-3 flex-wrap">
            <StatChip label="Jarak" value={formatDistance(stats.totalDistance)} color={previewColor} />
            <StatChip label="↑ Naik" value={`${stats.elevationGain}m`} color="#ffc857" />
            <StatChip label="↓ Turun" value={`${stats.elevationLoss}m`} color="#ff6b35" />
            {stats.duration && (
              <StatChip label="Durasi" value={formatDuration(stats.duration)} color="#607d8b" />
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {confirmingDelete ? (
        <div className="flex items-center gap-2 px-3 pb-3 pt-0">
          <span className="text-xs text-[#607d8b] flex-1">Hapus track ini?</span>
          <button onClick={onDeleteConfirm}
            className="px-3 py-1.5 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg text-xs font-condensed font-semibold">
            Hapus
          </button>
          <button onClick={onDeleteCancel}
            className="px-3 py-1.5 bg-[#111518] border border-[#1f2a32] text-[#607d8b] rounded-lg text-xs font-condensed">
            Batal
          </button>
        </div>
      ) : (
        <div className="flex border-t border-[#1f2a32]">
          <button
            onClick={onLoad}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-condensed font-semibold
              text-[#607d8b] hover:text-[#00e5a0] hover:bg-[#00e5a0]/5 transition-colors"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
              <path d="M2 8h12M8 2l6 6-6 6"/>
            </svg>
            Muat ke Peta
          </button>
          <div className="w-px bg-[#1f2a32]" />
          <button
            onClick={onDeleteRequest}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-condensed font-semibold
              text-[#607d8b] hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
              <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9"/>
            </svg>
            Hapus
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Mini SVG map preview ─────────────────────────────────────

function MiniMapPreview({ points, color }: { points: { lat: number; lon: number }[], color: string }) {
  if (points.length < 2) {
    return (
      <div className="w-[72px] h-[72px] rounded-lg bg-[#111518] border border-[#1f2a32] flex items-center justify-center">
        <span className="text-[#607d8b] text-[10px]">—</span>
      </div>
    )
  }

  const lats = points.map((p) => p.lat)
  const lons = points.map((p) => p.lon)
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const minLon = Math.min(...lons), maxLon = Math.max(...lons)

  const W = 72, H = 72, PAD = 8
  const rangeX = maxLon - minLon || 0.001
  const rangeY = maxLat - minLat || 0.001
  const scale = Math.min((W - PAD * 2) / rangeX, (H - PAD * 2) / rangeY)

  // Subsample for performance (max 80 points for preview)
  const step = Math.max(1, Math.floor(points.length / 80))
  const sampled = points.filter((_, i) => i % step === 0 || i === points.length - 1)

  const toX = (lon: number) => PAD + (lon - minLon) * scale
  const toY = (lat: number) => H - PAD - (lat - minLat) * scale

  const d = sampled
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.lon).toFixed(1)},${toY(p.lat).toFixed(1)}`)
    .join(' ')

  const start = sampled[0]
  const end = sampled[sampled.length - 1]

  return (
    <div className="w-[72px] h-[72px] rounded-lg bg-[#111518] border border-[#1f2a32] overflow-hidden flex-shrink-0">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Track line */}
        <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
        {/* Start dot */}
        <circle cx={toX(start.lon)} cy={toY(start.lat)} r={3} fill="#00e5a0" />
        {/* End dot */}
        <circle cx={toX(end.lon)} cy={toY(end.lat)} r={3} fill="#ff6b35" />
      </svg>
    </div>
  )
}

// ─── Stat chip ────────────────────────────────────────────────

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] uppercase tracking-wider text-[#607d8b] font-condensed">{label}</span>
      <span className="font-mono text-[12px] font-bold" style={{ color }}>{value}</span>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="text-center py-12 px-4">
      <div className="text-4xl mb-3">🗺️</div>
      <div className="font-condensed text-base font-semibold text-white mb-1">
        Belum ada track tersimpan
      </div>
      <p className="text-sm text-[#607d8b]">
        Mulai tracking dengan tombol <span className="text-[#00e5a0]">Lacak</span>,
        lalu simpan setelah selesai.
      </p>
    </div>
  )
}
