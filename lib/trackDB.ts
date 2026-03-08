/**
 * trackDB.ts — IndexedDB persistence for saved track sessions
 * Uses the native IndexedDB API (no extra dependency needed)
 */

import type { TrackPoint, Waypoint, GPXStats } from '@/types'

export interface SavedTrack {
  id: string
  name: string
  date: string          // ISO string
  points: TrackPoint[]
  waypoints: Waypoint[]
  stats: GPXStats
  previewColor: string  // random accent color per track
}

const DB_NAME = 'trailnav'
const DB_VERSION = 1
const STORE = 'tracks'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' })
        store.createIndex('date', 'date', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveTrack(track: SavedTrack): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(track)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getAllTracks(): Promise<SavedTrack[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).index('date').getAll()
    req.onsuccess = () => resolve((req.result as SavedTrack[]).reverse()) // newest first
    req.onerror = () => reject(req.error)
  })
}

export async function getTrack(id: string): Promise<SavedTrack | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(id)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => reject(req.error)
  })
}

export async function updateTrackName(id: string, name: string): Promise<void> {
  const db = await openDB()
  return new Promise(async (resolve, reject) => {
    const track = await getTrack(id)
    if (!track) return reject(new Error('Track not found'))
    track.name = name
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(track)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function deleteTrack(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getTrackCount(): Promise<number> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).count()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// Preview colors — cycle through these per track
const PREVIEW_COLORS = ['#00e5a0', '#00b8d4', '#ff6b35', '#ffc857', '#a78bfa', '#f472b6']
export function getNextColor(index: number): string {
  return PREVIEW_COLORS[index % PREVIEW_COLORS.length]
}
