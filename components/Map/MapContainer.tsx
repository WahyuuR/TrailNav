'use client'

import { useEffect, useRef } from 'react'
import { MapContainer as LeafletMapContainer, TileLayer, useMap } from 'react-leaflet'
import { useMapStore } from '@/store/mapStore'
import { LAYER_CONFIGS, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/layers'
import LocationMarker from './LocationMarker'
import TrackLayer from './TrackLayer'
import GPXLayer from './GPXLayer'
import WaypointLayer from './WaypointLayer'

// Registers the Leaflet map instance into Zustand + handles auto-center
function MapController() {
  const map = useMap()
  const hasCenteredRef = useRef(false)
  const { currentGPS, setMapInstance } = useMapStore()

  // Register map instance in store on mount, clear on unmount
  useEffect(() => {
    setMapInstance(map)
    return () => setMapInstance(null)
  }, [map, setMapInstance])

  // Auto-center once on first GPS fix
  useEffect(() => {
    if (currentGPS && !hasCenteredRef.current) {
      hasCenteredRef.current = true
      map.setView([currentGPS.lat, currentGPS.lon], 16, { animate: true })
    }
  }, [currentGPS, map])

  return null
}

export default function MapContainer() {
  const { activeLayer } = useMapStore()
  const activeConfig = LAYER_CONFIGS.find((c) => c.id === activeLayer) ?? LAYER_CONFIGS[0]

  return (
    <LeafletMapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ width: '100vw', height: '100dvh', position: 'fixed', top: 0, left: 0, zIndex: 1 }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        key={activeLayer}
        url={activeConfig.url}
        attribution={activeConfig.attribution}
        maxZoom={activeConfig.maxZoom}
      />
      <MapController />
      <LocationMarker />
      <TrackLayer />
      <GPXLayer />
      <WaypointLayer />
    </LeafletMapContainer>
  )
}
