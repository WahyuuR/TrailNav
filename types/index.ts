// ─── Core geo types ──────────────────────────────────────────

export interface TrackPoint {
  lat: number
  lon: number
  ele: number        // elevation in meters
  time?: Date
  speed?: number     // m/s from GPS
  accuracy?: number  // meters
}

export interface Waypoint {
  id: string
  lat: number
  lon: number
  name: string
  ele?: number
  createdAt: Date
}

export interface GPXData {
  name?: string
  trackPoints: TrackPoint[]
  waypoints: Waypoint[]
  stats: GPXStats
}

export interface GPXStats {
  totalDistance: number   // meters
  elevationGain: number   // meters
  elevationLoss: number   // meters
  maxElevation: number    // meters
  minElevation: number    // meters
  duration?: number       // seconds
}

// ─── Map types ───────────────────────────────────────────────

export type MapLayer = 'osm' | 'topo' | 'satellite' | 'terrain'

export interface LayerConfig {
  id: MapLayer
  label: string
  url: string
  attribution: string
  maxZoom: number
  color: string
}

// ─── GPS types ───────────────────────────────────────────────

export interface GPSState {
  lat: number
  lon: number
  ele: number
  accuracy: number
  speed: number      // km/h
  heading?: number   // degrees
}

export type GPSStatus = 'off' | 'searching' | 'active' | 'error'

// ─── Track recording types ───────────────────────────────────

export interface TrackSession {
  id: string
  name: string
  startTime: Date
  endTime?: Date
  points: TrackPoint[]
  stats: GPXStats
}

// ─── Store types ─────────────────────────────────────────────

export interface MapStoreState {
  // GPS
  gpsStatus: GPSStatus
  currentGPS: GPSState | null

  // Tracking
  isTracking: boolean
  trackPoints: TrackPoint[]
  trackStartTime: Date | null
  trackDistance: number    // meters
  elevationGain: number    // meters
  elevationLoss: number    // meters
  lastElevation: number | null

  // GPX
  gpxData: GPXData | null

  // Map UI
  activeLayer: MapLayer
  waypoints: Waypoint[]
  waypointCount: number
  isAddingWaypoint: boolean

  // Actions
  setGPSStatus: (status: GPSStatus) => void
  setCurrentGPS: (gps: GPSState | null) => void
  startTracking: () => void
  stopTracking: () => void
  addTrackPoint: (point: TrackPoint) => void
  setGPXData: (data: GPXData | null) => void
  setActiveLayer: (layer: MapLayer) => void
  addWaypoint: (waypoint: Waypoint) => void
  removeWaypoint: (id: string) => void
  setIsAddingWaypoint: (value: boolean) => void
  clearAll: () => void
}
