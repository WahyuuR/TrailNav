'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  saveTrack,
  getAllTracks,
  deleteTrack,
  updateTrackName,
  getTrackCount,
  getNextColor,
  type SavedTrack,
} from '@/lib/trackDB'
import { calcElevationStats, calcTotalDistance } from '@/lib/geo'
import type { TrackPoint, Waypoint } from '@/types'

export function useTrackHistory() {
  const [tracks, setTracks] = useState<SavedTrack[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load all tracks on mount
  const reload = useCallback(async () => {
    setIsLoading(true)
    try {
      const all = await getAllTracks()
      setTracks(all)
    } catch (e) {
      console.error('Failed to load tracks:', e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  // Save a completed tracking session
  const saveSession = useCallback(async (
    points: TrackPoint[],
    waypoints: Waypoint[],
    name?: string
  ): Promise<string> => {
    const elevations = points.map((p) => p.ele)
    const { gain, loss, max, min } = calcElevationStats(elevations)
    const totalDistance = calcTotalDistance(points)

    const count = await getTrackCount()
    const color = getNextColor(count)

    let duration: number | undefined
    const times = points.map((p) => p.time).filter(Boolean) as Date[]
    if (times.length >= 2) {
      duration = (times[times.length - 1].getTime() - times[0].getTime()) / 1000
    }

    const id = `track-${Date.now()}`
    const track: SavedTrack = {
      id,
      name: name || `Track ${new Date().toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric'
      })}`,
      date: new Date().toISOString(),
      points,
      waypoints,
      stats: {
        totalDistance,
        elevationGain: gain,
        elevationLoss: loss,
        maxElevation: max,
        minElevation: min,
        duration,
      },
      previewColor: color,
    }

    await saveTrack(track)
    await reload()
    return id
  }, [reload])

  const remove = useCallback(async (id: string) => {
    await deleteTrack(id)
    await reload()
  }, [reload])

  const rename = useCallback(async (id: string, name: string) => {
    await updateTrackName(id, name)
    await reload()
  }, [reload])

  return { tracks, isLoading, saveSession, remove, rename, reload }
}
