import { chunkArray } from '@/lib/geo'

const ELEVATION_API =
  process.env.NEXT_PUBLIC_ELEVATION_API_URL ||
  'https://api.open-elevation.com/api/v1/lookup'

interface ElevationPoint {
  lat: number
  lon: number
}

interface ElevationResult {
  latitude: number
  longitude: number
  elevation: number
}

/**
 * Fetch elevation for a batch of coordinates.
 * Chunks into groups of 100 (API limit).
 * Returns an array of elevations in the same order as the input.
 */
export async function getElevationBatch(
  points: ElevationPoint[]
): Promise<number[]> {
  if (points.length === 0) return []

  const chunks = chunkArray(points, 100)
  const results: number[] = []

  for (const chunk of chunks) {
    try {
      const res = await fetch(ELEVATION_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locations: chunk.map((p) => ({
            latitude: p.lat,
            longitude: p.lon,
          })),
        }),
        signal: AbortSignal.timeout(8000),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data: { results: ElevationResult[] } = await res.json()
      results.push(...data.results.map((r) => r.elevation))
    } catch {
      // Fallback: push 0 for each point in this chunk
      results.push(...chunk.map(() => 0))
    }
  }

  return results
}

/**
 * Get elevation for a single coordinate.
 */
export async function getElevationSingle(
  lat: number,
  lon: number
): Promise<number | null> {
  try {
    const [ele] = await getElevationBatch([{ lat, lon }])
    return ele ?? null
  } catch {
    return null
  }
}
