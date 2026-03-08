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

// Inner component to expose map controls
function MapController({
  layerRef,
}: {
  layerRef: React.MutableRefObject<ReturnType<typeof useMap> | null>
}) {
  const map = useMap()
  layerRef.current = map
  return null
}

export interface MapHandle {
  centerOnLocation: () => void
  setLayer: (layer: MapLayer) => void
  getMap: () => ReturnType<typeof useMap> | null
}

const MapContainer = forwardRef<MapHandle>((_, ref) => {
  const mapRef = useRef<ReturnType<typeof useMap> | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const { activeLayer, currentGPS } = useMapStore()

  useImperativeHandle(ref, () => ({
    centerOnLocation: () => {
      if (mapRef.current && currentGPS) {
        mapRef.current.setView([currentGPS.lat, currentGPS.lon], 16, { animate: true })
      }
    },
    setLayer: (_layer: MapLayer) => {
      // Layer changes handled via activeLayer in store + TileLayer key prop
    },
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
      {/* Dynamic tile layer — key forces remount on layer change */}
      <TileLayer
        key={activeLayer}
        url={activeConfig.url}
        attribution={activeConfig.attribution}
        maxZoom={activeConfig.maxZoom}
      />

      <MapController layerRef={mapRef} />
      <LocationMarker />
      <TrackLayer />
      <GPXLayer />
      <WaypointLayer />
    </LeafletMapContainer>
  )
})

MapContainer.displayName = 'MapContainer'
export default MapContainer
