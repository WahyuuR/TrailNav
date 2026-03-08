import { create } from 'zustand'
import type { MapStoreState, GPSState, GPSStatus, TrackPoint, GPXData, MapLayer, Waypoint } from '@/types'
import { haversine } from '@/lib/geo'
import type { Map as LeafletMap } from 'leaflet'

// Extend store state with map instance (not serialized — just a ref)
interface MapStoreStateWithMap extends MapStoreState {
  _mapInstance: LeafletMap | null
  setMapInstance: (map: LeafletMap | null) => void
}

export const useMapStore = create<MapStoreStateWithMap>((set, get) => ({
  // ─── Internal map instance ────────────────────────────────
  _mapInstance: null,
  setMapInstance: (map) => set({ _mapInstance: map }),

  // ─── GPS ─────────────────────────────────────────────────
  gpsStatus: 'off',
  currentGPS: null,
  setGPSStatus: (status: GPSStatus) => set({ gpsStatus: status }),
  setCurrentGPS: (gps: GPSState | null) => set({ currentGPS: gps }),

  // ─── Tracking ────────────────────────────────────────────
  isTracking: false,
  trackPoints: [],
  trackStartTime: null,
  trackDistance: 0,
  elevationGain: 0,
  elevationLoss: 0,
  lastElevation: null,

  startTracking: () =>
    set({
      isTracking: true,
      trackPoints: [],
      trackStartTime: new Date(),
      trackDistance: 0,
      elevationGain: 0,
      elevationLoss: 0,
      lastElevation: null,
    }),

  stopTracking: () => set({ isTracking: false }),

  addTrackPoint: (point: TrackPoint) => {
    const { trackPoints, trackDistance, elevationGain, elevationLoss, lastElevation } = get()
    let newDistance = trackDistance
    if (trackPoints.length > 0) {
      const prev = trackPoints[trackPoints.length - 1]
      newDistance += haversine(prev.lat, prev.lon, point.lat, point.lon)
    }
    let newGain = elevationGain
    let newLoss = elevationLoss
    if (lastElevation !== null) {
      const diff = point.ele - lastElevation
      if (diff > 0.5) newGain += diff
      else if (diff < -0.5) newLoss += Math.abs(diff)
    }
    set({
      trackPoints: [...trackPoints, point],
      trackDistance: newDistance,
      elevationGain: newGain,
      elevationLoss: newLoss,
      lastElevation: point.ele,
    })
  },

  // ─── GPX ─────────────────────────────────────────────────
  gpxData: null,
  setGPXData: (data: GPXData | null) => set({ gpxData: data }),

  // ─── Map UI ──────────────────────────────────────────────
  activeLayer: 'osm',
  waypoints: [],
  waypointCount: 0,
  isAddingWaypoint: false,

  setActiveLayer: (layer: MapLayer) => set({ activeLayer: layer }),
  addWaypoint: (waypoint: Waypoint) =>
    set((state) => ({
      waypoints: [...state.waypoints, waypoint],
      waypointCount: state.waypointCount + 1,
    })),
  removeWaypoint: (id: string) =>
    set((state) => ({ waypoints: state.waypoints.filter((w) => w.id !== id) })),
  setIsAddingWaypoint: (value: boolean) => set({ isAddingWaypoint: value }),

  // ─── Clear ───────────────────────────────────────────────
  clearAll: () =>
    set({
      isTracking: false,
      trackPoints: [],
      trackStartTime: null,
      trackDistance: 0,
      elevationGain: 0,
      elevationLoss: 0,
      lastElevation: null,
      gpxData: null,
      waypoints: [],
      waypointCount: 0,
      isAddingWaypoint: false,
    }),
}))

// ─── Convenience helpers — call from anywhere, no ref needed ─
export const mapZoomIn  = () => useMapStore.getState()._mapInstance?.zoomIn()
export const mapZoomOut = () => useMapStore.getState()._mapInstance?.zoomOut()
export const mapSetView = (lat: number, lon: number, zoom = 16) =>
  useMapStore.getState()._mapInstance?.setView([lat, lon], zoom, { animate: true })
