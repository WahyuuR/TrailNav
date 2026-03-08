'use client'

import { useCallback } from 'react'
import { useMapStore } from '@/store/mapStore'
import { parseGPX } from '@/lib/gpxParser'
import { getElevationBatch } from '@/lib/elevation'
import { calcElevationStats, calcTotalDistance } from '@/lib/geo'
import type { GPXData, TrackPoint } from '@/types'

export function useGPX() {
  const { setGPXData, gpxData } = useMapStore()

  // ─── Load from file ──────────────────────────────────────
  const loadFile = useCallback(async (file: File): Promise<void> => {
    const text = await file.text()
    const data = parseGPX(text)

    // Enrich elevations from API if GPS elevation is all zeros
    const allZero = data.trackPoints.every((p) => p.ele === 0)
    if (allZero && data.trackPoints.length > 0) {
      const elevations = await getElevationBatch(
        data.trackPoints.map((p) => ({ lat: p.lat, lon: p.lon }))
      )
      data.trackPoints = data.trackPoints.map((p, i) => ({
        ...p,
        ele: elevations[i] ?? 0,
      }))
      // Recalculate stats
      const { gain, loss, max, min } = calcElevationStats(elevations)
      data.stats = {
        ...data.stats,
        elevationGain: gain,
        elevationLoss: loss,
        maxElevation: max,
        minElevation: min,
      }
    }

    setGPXData(data)
  }, [setGPXData])

  // ─── Load demo route ─────────────────────────────────────
  const loadDemo = useCallback(() => {
    const trackPoints: TrackPoint[] = []
    const totalPts = 150
    const baseLat = -7.541
    const baseLon = 110.446

    for (let i = 0; i < totalPts; i++) {
      const t = i / totalPts
      const lat = baseLat + Math.sin(t * Math.PI * 2) * 0.02 + t * 0.01
      const lon = baseLon + t * 0.04 + Math.cos(t * Math.PI * 1.5) * 0.01
      const baseElev =
        t < 0.5
          ? 800 + t * 2 * 1400 + Math.random() * 30
          : 2200 - (t - 0.5) * 2 * 1400 + Math.random() * 30
      trackPoints.push({
        lat,
        lon,
        ele: Math.round(baseElev),
        time: new Date(Date.now() - (totalPts - i) * 60000),
      })
    }

    const elevations = trackPoints.map((p) => p.ele)
    const { gain, loss, max, min } = calcElevationStats(elevations)
    const totalDistance = calcTotalDistance(trackPoints)

    const data: GPXData = {
      name: 'Demo — Pendakian Merapi',
      trackPoints,
      waypoints: [
        {
          id: 'demo-wpt-1',
          lat: trackPoints[20].lat,
          lon: trackPoints[20].lon,
          ele: trackPoints[20].ele,
          name: 'Pos 1',
          createdAt: new Date(),
        },
        {
          id: 'demo-wpt-2',
          lat: trackPoints[60].lat,
          lon: trackPoints[60].lon,
          ele: trackPoints[60].ele,
          name: 'Pos 2',
          createdAt: new Date(),
        },
        {
          id: 'demo-wpt-3',
          lat: trackPoints[75].lat,
          lon: trackPoints[75].lon,
          ele: trackPoints[75].ele,
          name: 'Puncak',
          createdAt: new Date(),
        },
      ],
      stats: {
        totalDistance,
        elevationGain: gain,
        elevationLoss: loss,
        maxElevation: max,
        minElevation: min,
        duration: totalPts * 60,
      },
    }

    setGPXData(data)
  }, [setGPXData])

  const clearGPX = useCallback(() => setGPXData(null), [setGPXData])

  return { gpxData, loadFile, loadDemo, clearGPX }
}
