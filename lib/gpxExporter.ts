import type { TrackPoint, Waypoint } from '@/types'

/**
 * Generate a GPX 1.1 XML string from track points and waypoints.
 */
export function exportGPX(
  trackPoints: TrackPoint[],
  waypoints: Waypoint[],
  name = 'TrailNav Track'
): string {
  const now = new Date().toISOString()

  const wptXml = waypoints
    .map(
      (w) => `
  <wpt lat="${w.lat.toFixed(7)}" lon="${w.lon.toFixed(7)}">
    ${w.ele !== undefined ? `<ele>${w.ele.toFixed(1)}</ele>` : ''}
    <name>${escapeXml(w.name)}</name>
    <time>${w.createdAt.toISOString()}</time>
  </wpt>`
    )
    .join('')

  const trkptXml = trackPoints
    .map(
      (p) => `
      <trkpt lat="${p.lat.toFixed(7)}" lon="${p.lon.toFixed(7)}">
        <ele>${p.ele.toFixed(1)}</ele>
        ${p.time ? `<time>${p.time.toISOString()}</time>` : ''}
        ${p.speed !== undefined ? `<speed>${p.speed.toFixed(2)}</speed>` : ''}
      </trkpt>`
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1"
  creator="TrailNav"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1
    http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${escapeXml(name)}</name>
    <time>${now}</time>
  </metadata>
${wptXml}
  <trk>
    <name>${escapeXml(name)}</name>
    <trkseg>${trkptXml}
    </trkseg>
  </trk>
</gpx>`
}

/**
 * Trigger a browser download of the GPX string as a .gpx file.
 */
export function downloadGPX(gpxString: string, filename = 'trailnav-track'): void {
  const blob = new Blob([gpxString], { type: 'application/gpx+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.gpx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
