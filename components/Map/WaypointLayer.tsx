'use client'

import { useEffect } from 'react'
import { Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useMapStore } from '@/store/mapStore'
import { formatCoordDMS } from '@/lib/geo'
import type { Waypoint } from '@/types'

const makeWaypointIcon = (num: number) =>
  L.divIcon({
    html: `<div style="background:#ffc857;color:#0a0d0f;width:24px;height:24px;border-radius:50%;
      border:2px solid white;display:flex;align-items:center;justify-content:center;
      font-family:'Space Mono',monospace;font-size:10px;font-weight:700;
      box-shadow:0 0 10px rgba(255,200,87,.5);">${num}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    className: '',
  })

function ClickHandler() {
  const { isAddingWaypoint, addWaypoint, waypointCount, setIsAddingWaypoint } = useMapStore()
  const map = useMap()

  useEffect(() => {
    map.getContainer().style.cursor = isAddingWaypoint ? 'crosshair' : ''
  }, [isAddingWaypoint, map])

  useMapEvents({
    click(e) {
      if (!isAddingWaypoint) return
      const wpt: Waypoint = {
        id: `wpt-${Date.now()}`,
        lat: e.latlng.lat,
        lon: e.latlng.lng,
        name: `Waypoint ${waypointCount + 1}`,
        createdAt: new Date(),
      }
      addWaypoint(wpt)
      setIsAddingWaypoint(false)
    },
  })

  return null
}

export default function WaypointLayer() {
  const { waypoints, removeWaypoint } = useMapStore()

  return (
    <>
      <ClickHandler />
      {waypoints.map((wpt, i) => (
        <Marker
          key={wpt.id}
          position={[wpt.lat, wpt.lon]}
          icon={makeWaypointIcon(i + 1)}
          draggable
        >
          <Popup>
            <div className="text-sm" style={{ minWidth: 140 }}>
              <b style={{ color: '#ffc857', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 15 }}>
                {wpt.name}
              </b>
              <div style={{ color: '#607d8b', fontFamily: 'monospace', fontSize: 11, marginTop: 4, lineHeight: 1.6 }}>
                {formatCoordDMS(wpt.lat, 'lat')}
                <br />
                {formatCoordDMS(wpt.lon, 'lon')}
              </div>
              <div style={{ color: '#607d8b', fontSize: 11, marginTop: 4 }}>
                Seret untuk memindahkan
              </div>
              <button
                onClick={() => removeWaypoint(wpt.id)}
                style={{
                  marginTop: 8, width: '100%', padding: '4px 0',
                  background: 'transparent', border: '1px solid #444',
                  borderRadius: 6, color: '#607d8b', cursor: 'pointer', fontSize: 11,
                }}
              >
                Hapus waypoint
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  )
}
