'use client'

import { useEffect } from 'react'
import { useMap, Marker, Circle } from 'react-leaflet'
import L from 'leaflet'
import { useMapStore } from '@/store/mapStore'

const locationIcon = L.divIcon({
  html: `<div style="
    width:20px;height:20px;border-radius:50%;
    background:rgba(0,229,160,0.2);
    border:2px solid #00e5a0;
    position:relative;
    animation:loc-pulse 2s infinite;
  ">
    <div style="
      width:8px;height:8px;border-radius:50%;
      background:#00e5a0;
      position:absolute;top:50%;left:50%;
      transform:translate(-50%,-50%);
      box-shadow:0 0 6px #00e5a0;
    "></div>
  </div>
  <style>
    @keyframes loc-pulse {
      0%,100%{box-shadow:0 0 0 0 rgba(0,229,160,.4)}
      50%{box-shadow:0 0 0 10px rgba(0,229,160,0)}
    }
  </style>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  className: '',
})

export default function LocationMarker() {
  const map = useMap()
  const { currentGPS, isTracking } = useMapStore()

  // Auto-pan when actively tracking
  useEffect(() => {
    if (isTracking && currentGPS) {
      map.panTo([currentGPS.lat, currentGPS.lon], { animate: true, duration: 0.5 })
    }
  }, [currentGPS, isTracking, map])

  if (!currentGPS) return null

  return (
    <>
      <Circle
        center={[currentGPS.lat, currentGPS.lon]}
        radius={currentGPS.accuracy}
        pathOptions={{
          color: '#00e5a0', fillColor: '#00e5a0',
          fillOpacity: 0.08, weight: 1, opacity: 0.4,
        }}
      />
      <Marker position={[currentGPS.lat, currentGPS.lon]} icon={locationIcon} zIndexOffset={1000} />
    </>
  )
}
