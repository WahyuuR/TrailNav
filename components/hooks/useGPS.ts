'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useMapStore } from '@/store/mapStore'
import type { GPSState } from '@/types'

export function useGPS() {
  const watchIdRef = useRef<number | null>(null)
  const { setGPSStatus, setCurrentGPS, isTracking, addTrackPoint } = useMapStore()

  const startWatch = useCallback(() => {
    if (!navigator.geolocation) {
      setGPSStatus('error')
      return
    }

    setGPSStatus('searching')

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, altitude, accuracy, speed } = pos.coords

        const gps: GPSState = {
          lat: latitude,
          lon: longitude,
          ele: altitude ?? 0,
          accuracy: Math.round(accuracy),
          speed: speed ? parseFloat((speed * 3.6).toFixed(1)) : 0,
          heading: pos.coords.heading ?? undefined,
        }

        setGPSStatus('active')
        setCurrentGPS(gps)

        // Also record to track if tracking is active
        if (isTracking) {
          addTrackPoint({
            lat: latitude,
            lon: longitude,
            ele: altitude ?? 0,
            time: new Date(pos.timestamp),
            speed: speed ?? undefined,
            accuracy,
          })
        }
      },
      (err) => {
        console.error('GPS error:', err.message)
        setGPSStatus('error')
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 15000,
      }
    )
  }, [setGPSStatus, setCurrentGPS, isTracking, addTrackPoint])

  const stopWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setGPSStatus('off')
    setCurrentGPS(null)
  }, [setGPSStatus, setCurrentGPS])

  const getOnce = useCallback(() => {
    if (!navigator.geolocation) {
      setGPSStatus('error')
      return
    }
    setGPSStatus('searching')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, altitude, accuracy, speed } = pos.coords
        setGPSStatus('active')
        setCurrentGPS({
          lat: latitude,
          lon: longitude,
          ele: altitude ?? 0,
          accuracy: Math.round(accuracy),
          speed: speed ? parseFloat((speed * 3.6).toFixed(1)) : 0,
        })
      },
      (err) => {
        console.error('GPS error:', err.message)
        setGPSStatus('error')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [setGPSStatus, setCurrentGPS])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  return { startWatch, stopWatch, getOnce }
}
