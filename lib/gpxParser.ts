import type { GPXData, TrackPoint, Waypoint } from '@/types'
import {
  haversine,
  calcElevationStats,
  calcTotalDistance,
} from '@/lib/geo'

/**
 * Parse a GPX XML string into a GPXData object.
 * Supports GPX 1.0 and 1.1 — trk, rte, wpt elements.
 */
export function parseGPX(gpxText: string): GPXData {
  const parser = new DOMParser()
  const doc = parser.parseFromString(gpxText, 'application/xml')

  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    throw new Error('Invalid GPX file: ' + parserError.textContent)
  }

  const name =
    doc.querySelector('metadata > name')?.textContent ||
    doc.querySelector('trk > name')?.textContent ||
    undefined

  // ─── Track points ─────────────────────────────────────────
  const trkptEls = doc.querySelectorAll('trkpt')
  const rteEls = doc.querySelectorAll('rtept')

  const parsePointEl = (el: Element): TrackPoint => {
    const lat = parseFloat(el.getAttribute('lat') || '0')
    const lon = parseFloat(el.getAttribute('lon') || '0')
    const ele = parseFloat(el.querySelector('ele')?.textContent || '0')
    const timeStr = el.querySelector('time')?.textContent
    const time = timeStr ? new Date(timeStr) : undefined
    const speedStr = el.querySelector('speed')?.textContent
    const speed = speedStr ? parseFloat(speedStr) : undefined
    return { lat, lon, ele, time, speed }
  }

  const trackPoints: TrackPoint[] = [
    ...Array.from(trkptEls).map(parsePointEl),
    ...Array.from(rteEls).map(parsePointEl),
  ]

  // ─── Waypoints ────────────────────────────────────────────
  const wptEls = doc.querySelectorAll('wpt')
  const waypoints: Waypoint[] = Array.from(wptEls).map((el, i) => ({
    id: `gpx-wpt-${i}`,
    lat: parseFloat(el.getAttribute('lat') || '0'),
    lon: parseFloat(el.getAttribute('lon') || '0'),
    name: el.querySelector('name')?.textContent || `Waypoint ${i + 1}`,
    ele: parseFloat(el.querySelector('ele')?.textContent || '0') || undefined,
    createdAt: new Date(),
  }))

  // ─── Stats ────────────────────────────────────────────────
  const elevations = trackPoints.map((p) => p.ele)
  const { gain, loss, max, min } = calcElevationStats(elevations)
  const totalDistance = calcTotalDistance(trackPoints)

  // Duration from timestamps
  let duration: number | undefined
  const times = trackPoints.map((p) => p.time).filter(Boolean) as Date[]
  if (times.length >= 2) {
    duration = (times[times.length - 1].getTime() - times[0].getTime()) / 1000
  }

  return {
    name,
    trackPoints,
    waypoints,
    stats: {
      totalDistance,
      elevationGain: gain,
      elevationLoss: loss,
      maxElevation: max,
      minElevation: min,
      duration,
    },
  }
}
