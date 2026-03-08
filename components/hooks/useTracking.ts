'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useMapStore } from '@/store/mapStore'
import { useGPS } from './useGPS'
import { useTrackHistory } from './useTrackHistory'
import { exportGPX, downloadGPX } from '@/lib/gpxExporter'
import { formatDuration } from '@/lib/geo'

export function useTracking() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const {
    isTracking,
    trackPoints,
    trackDistance,
    elevationGain,
    elevationLoss,
    trackStartTime,
    waypoints,
    startTracking: storeStart,
    stopTracking: storeStop,
  } = useMapStore()

  const { startWatch, stopWatch } = useGPS()
  const { saveSession } = useTrackHistory()

  // ─── Timer ─────────────────────────────────────────────
  useEffect(() => {
    if (isTracking) {
      timerRef.current = setInterval(() => {
        if (trackStartTime) {
          setElapsedSeconds(
            Math.floor((Date.now() - trackStartTime.getTime()) / 1000)
          )
        }
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      setElapsedSeconds(0)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isTracking, trackStartTime])

  // ─── Start ──────────────────────────────────────────────
  const start = useCallback(() => {
    storeStart()
    startWatch()
  }, [storeStart, startWatch])

  // ─── Stop + auto-save to IndexedDB ──────────────────────
  const stop = useCallback(async () => {
    storeStop()
    stopWatch()
    // Save session if we have points
    if (trackPoints.length > 2) {
      try {
        await saveSession(trackPoints, waypoints)
      } catch (e) {
        console.error('Failed to save track:', e)
      }
    }
  }, [storeStop, stopWatch, trackPoints, waypoints, saveSession])

  const toggle = useCallback(() => {
    if (isTracking) stop()
    else start()
  }, [isTracking, start, stop])

  // ─── Export GPX ─────────────────────────────────────────
  const exportTrack = useCallback(() => {
    if (trackPoints.length === 0) return
    const name = `TrailNav-${new Date().toISOString().slice(0, 10)}`
    const gpx = exportGPX(trackPoints, waypoints, name)
    downloadGPX(gpx, name)
  }, [trackPoints, waypoints])

  return {
    isTracking,
    elapsedSeconds,
    elapsedFormatted: formatDuration(elapsedSeconds),
    trackDistance,
    elevationGain: Math.round(elevationGain),
    elevationLoss: Math.round(elevationLoss),
    pointCount: trackPoints.length,
    start,
    stop,
    toggle,
    exportTrack,
  }
}
