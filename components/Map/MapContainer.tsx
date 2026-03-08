'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { MapContainer as LeafletMapContainer, TileLayer, useMap } from 'react-leaflet'
import { useMapStore } from '@/store/mapStore'
import { LAYER_CONFIGS, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/layers'
import type { MapLayer } from '@/types'
import LocationMarker from './LocationMarker'
import TrackLayer from './TrackLayer'
import GPXLayer from './GPXLayer'
import WaypointLayer from './WaypointLayer'

// Inner component — exposes map instance + handles auto-center on first GPS fix
function MapController({
  mapRef,
  gpsRef,
}: {
  mapRef: React.MutableRefObject<ReturnType<typeof useMap> | null>
  gpsRef: React.MutableRefObject<{ lat: number; lon: number } | null>
}) {
  const map = useMap()
  const hasCenteredRef = useRef(false)
  const { currentGPS } = useMapStore()

  mapRef.current = map

  // Auto-center ONCE on first GPS fix
  useEffect(() => {
    if (currentGPS && !hasCenteredRef.current) {
      hasCenteredRef.current = true
      map.setView([currentGPS.lat, currentGPS.lon], 16, { animate: true })
    }
    // Keep gpsRef in sync so imperative handle always reads latest coords
    if (currentGPS) {
      gpsRef.current = { lat: currentGPS.lat, lon: currentGPS.lon }
    }
  }, [currentGPS, map, gpsRef])

  return null
}

export interface MapHandle {
  centerOnLocation: () => void
  setLayer: (layer: MapLayer) => void
  getMap: () => ReturnType<typeof useMap> | null
}

const MapContainer = forwardRef<MapHandle>((_, ref) => {
  const mapRef = useRef<ReturnType<typeof useMap> | null>(null)
  // Ref always holds latest GPS coords — avoids stale closure in useImperativeHandle
  const gpsRef = useRef<{ lat: number; lon: number } | null>(null)
  const { activeLayer } = useMapStore()

  useImperativeHandle(ref, () => ({
    centerOnLocation: () => {
      if (mapRef.current && gpsRef.current) {
        mapRef.current.setView(
          [gpsRef.current.lat, gpsRef.current.lon],
          16,
          { animate: true }
        )
      }
    },
    setLayer: (_layer: MapLayer) => {},
    getMap: () => mapRef.current,
  }))

  const activeConfig = LAYER_CONFIGS.find((c) => c.id === activeLayer) ?? LAYER_CONFIGS[0]

  return (
    <LeafletMapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 1 }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        key={activeLayer}
        url={activeConfig.url}
        attribution={activeConfig.attribution}
        maxZoom={activeConfig.maxZoom}
      />

      <MapController mapRef={mapRef} gpsRef={gpsRef} />
      <LocationMarker />
      <TrackLayer />
      <GPXLayer />
      <WaypointLayer />
    </LeafletMapContainer>
  )
})

MapContainer.displayName = 'MapContainer'
export default MapContainer
