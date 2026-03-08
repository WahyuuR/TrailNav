// ─── Distance ────────────────────────────────────────────────

/**
 * Haversine formula — distance between two lat/lon points in meters
 */
export function haversine(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000 // Earth radius in meters
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Coordinate formatting ───────────────────────────────────

/**
 * Format decimal degrees to DMS string
 * e.g. -7.797068 → "7°47'49.4"S"
 */
export function formatCoordDMS(value: number, type: 'lat' | 'lon'): string {
  const abs = Math.abs(value)
  const deg = Math.floor(abs)
  const minFull = (abs - deg) * 60
  const min = Math.floor(minFull)
  const sec = ((minFull - min) * 60).toFixed(1)
  const dir =
    type === 'lat'
      ? value >= 0 ? 'N' : 'S'
      : value >= 0 ? 'E' : 'W'
  return `${deg}°${min}'${sec}"${dir}`
}

/**
 * Format decimal degrees to DD string
 * e.g. -7.797068 → "-7.797068°"
 */
export function formatCoordDD(value: number, decimals = 6): string {
  return `${value.toFixed(decimals)}°`
}

// ─── Bearing ─────────────────────────────────────────────────

/**
 * Compass bearing from point A to point B (0–360°)
 */
export function bearing(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const toDeg = (r: number) => (r * 180) / Math.PI
  const dLon = toRad(lon2 - lon1)
  const y = Math.sin(dLon) * Math.cos(toRad(lat2))
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

// ─── Elevation stats ─────────────────────────────────────────

export function calcElevationStats(elevations: number[]): {
  gain: number
  loss: number
  max: number
  min: number
} {
  if (elevations.length === 0) return { gain: 0, loss: 0, max: 0, min: 0 }

  let gain = 0
  let loss = 0
  for (let i = 1; i < elevations.length; i++) {
    const diff = elevations[i] - elevations[i - 1]
    if (diff > 0.5) gain += diff
    else if (diff < -0.5) loss += Math.abs(diff)
  }

  return {
    gain: Math.round(gain),
    loss: Math.round(loss),
    max: Math.round(Math.max(...elevations)),
    min: Math.round(Math.min(...elevations)),
  }
}

// ─── Distance along track ────────────────────────────────────

export function calcTotalDistance(
  points: { lat: number; lon: number }[]
): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += haversine(
      points[i - 1].lat, points[i - 1].lon,
      points[i].lat, points[i].lon
    )
  }
  return total
}

/**
 * Cumulative distances array — one value per point
 */
export function cumulativeDistances(
  points: { lat: number; lon: number }[]
): number[] {
  const dists = [0]
  for (let i = 1; i < points.length; i++) {
    dists.push(
      dists[i - 1] +
      haversine(
        points[i - 1].lat, points[i - 1].lon,
        points[i].lat, points[i].lon
      )
    )
  }
  return dists
}

// ─── Format helpers ──────────────────────────────────────────

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(2)} km`
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

export function formatSpeed(ms: number): string {
  return `${(ms * 3.6).toFixed(1)} km/h`
}

// ─── Array helpers ───────────────────────────────────────────

export function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}
