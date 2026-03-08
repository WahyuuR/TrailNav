'use client'

import { useEffect } from 'react'
import { Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useMapStore } from '@/store/mapStore'
import { formatCoordDMS } from '@/lib/geo'

const startIcon = L.divIcon({
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#00e5a0;border:2px solid white;box-shadow:0 0 8px rgba(0,229,160,.6);"></div>`,
  iconSize: [14, 14], iconAnchor: [7, 7], className: '',
})

const endIcon = L.divIcon({
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#ff6b35;border:2px solid white;box-shadow:0 0 8px rgba(255,107,53,.6);"></div>`,
  iconSize: [14, 14], iconAnchor: [7, 7], className: '',
})

const waypointIcon = (name: string) =>
  L.divIcon({
    html: `<div style="background:#ffc857;color:#0a0d0f;width:22px;height:22px;border-radius:50%;
      border:2px solid white;display:flex;align-items:center;justify-content:center;
      font-family:'Space Mono',monospace;font-size:8px;font-weight:700;
      box-shadow:0 0 8px rgba(255,200,87,.5);">${name.slice(0,2)}</div>`,
    iconSize: [22, 22], iconAnchor: [11, 11], className: '',
  })

export default function GPXLayer() {
  const map = useMap()
  const { gpxData } = useMapStore()

  // Fit map to GPX bounds when data loads
  useEffect(() => {
    if (!gpxData || gpxData.trackPoints.length === 0) return
    const coords = gpxData.trackPoints.map((p) => [p.lat, p.lon] as [number, number])
    const bounds = L.latLngBounds(coords)
    map.fitBounds(bounds, { padding: [40, 40], animate: true })
  }, [gpxData, map])

  if (!gpxData || gpxData.trackPoints.length === 0) return null

  const coords = gpxData.trackPoints.map((p) => [p.lat, p.lon] as [number, number])
  const start = coords[0]
  const end = coords[coords.length - 1]

  return (
    <>
      {/* Track line */}
      <Polyline
        positions={coords}
        pathOptions={{ color: '#ff6b35', weight: 3.5, opacity: 0.9 }}
      />

      {/* Start marker */}
      <Marker position={start} icon={startIcon}>
        <Popup>
          <div className="text-sm">
            <b style={{ color: '#00e5a0' }}>Start</b>
            <br />
            <small style={{ color: '#607d8b', fontFamily: 'monospace' }}>
              {formatCoordDMS(start[0], 'lat')}
              <br />
              {formatCoordDMS(start[1], 'lon')}
            </small>
          </div>
        </Popup>
      </Marker>

      {/* End marker */}
      <Marker position={end} icon={endIcon}>
        <Popup>
          <div className="text-sm">
            <b style={{ color: '#ff6b35' }}>Finish</b>
            <br />
            <small style={{ color: '#607d8b', fontFamily: 'monospace' }}>
              {formatCoordDMS(end[0], 'lat')}
              <br />
              {formatCoordDMS(end[1], 'lon')}
            </small>
          </div>
        </Popup>
      </Marker>

      {/* GPX Waypoints */}
      {gpxData.waypoints.map((wpt) => (
        <Marker
          key={wpt.id}
          position={[wpt.lat, wpt.lon]}
          icon={waypointIcon(wpt.name)}
        >
          <Popup>
            <div className="text-sm">
              <b style={{ color: '#ffc857' }}>{wpt.name}</b>
              {wpt.ele !== undefined && (
                <div style={{ color: '#607d8b', fontFamily: 'monospace', fontSize: 11, marginTop: 2 }}>
                  ▲ {wpt.ele} m
                </div>
              )}
              <small style={{ color: '#607d8b', fontFamily: 'monospace' }}>
                {formatCoordDMS(wpt.lat, 'lat')}
                <br />
                {formatCoordDMS(wpt.lon, 'lon')}
              </small>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  )
}
