'use client'

import { Polyline } from 'react-leaflet'
import { useMapStore } from '@/store/mapStore'

export default function TrackLayer() {
  const { trackPoints, isTracking } = useMapStore()

  if (!isTracking || trackPoints.length < 2) return null

  const positions = trackPoints.map((p) => [p.lat, p.lon] as [number, number])

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: '#00e5a0',
        weight: 3,
        opacity: 0.85,
      }}
    />
  )
}
