# 🏔️ TrailNav

> Aplikasi navigasi medan berbasis web — GPS tracking, import/export GPX, profil elevasi, dan offline-ready sebagai PWA.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green?style=flat-square)
![PWA](https://img.shields.io/badge/PWA-offline--ready-purple?style=flat-square)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)

---

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Tech Stack](#-tech-stack)
- [Struktur Folder](#-struktur-folder)
- [Prasyarat](#-prasyarat)
- [Instalasi & Setup Lokal](#-instalasi--setup-lokal)
- [Environment Variables](#-environment-variables)
- [Deploy ke Vercel](#-deploy-ke-vercel)
- [PWA & Offline Setup](#-pwa--offline-setup)
- [Arsitektur Komponen](#-arsitektur-komponen)
- [Data Flow](#-data-flow)
- [API Reference](#-api-reference)
- [Roadmap](#-roadmap)
- [Kontribusi](#-kontribusi)

---

## ✨ Fitur

### MVP (v1.0)
- 📍 **GPS Tracking Real-time** — Lacak posisi, kecepatan, dan akurasi GPS langsung dari browser
- 🏔️ **Data Elevasi Akurat** — Elevasi dari GPS + fallback ke Open-Elevation API
- 📊 **Profil Elevasi Interaktif** — Grafis naik/turun sepanjang rute
- 🗺️ **Import GPX** — Muat file `.gpx` dari aplikasi lain (Garmin, Strava, Wikiloc, dsb.)
- 💾 **Export GPX** — Simpan hasil tracking sebagai file `.gpx`
- 📱 **PWA Offline-Ready** — Tile peta ter-cache, app berjalan tanpa internet
- 📌 **Waypoint** — Tandai lokasi penting di peta
- 🗺️ **Multi-layer Peta** — OSM Standard, Topografi, Satelit, Terrain

### Statistik yang Ditampilkan
| Statistik | Sumber |
|-----------|--------|
| Koordinat (DMS) | GPS Browser |
| Elevasi saat ini | GPS + Open-Elevation API |
| Akurasi GPS | GPS Browser |
| Jarak tempuh | Kalkulasi Haversine |
| Elevation gain ↑ | Akumulasi dari tracking |
| Elevation loss ↓ | Akumulasi dari tracking |
| Kecepatan | GPS Browser |
| Durasi | Timer internal |

---

## 🛠️ Tech Stack

### Frontend
| Package | Versi | Kegunaan |
|---------|-------|----------|
| `next` | 14.x | Framework utama (App Router) |
| `react` | 18.x | UI library |
| `typescript` | 5.x | Type safety |
| `tailwindcss` | 3.x | Styling utility-first |
| `leaflet` | 1.9.x | Map engine |
| `react-leaflet` | 4.x | React wrapper untuk Leaflet |
| `zustand` | 4.x | State management (GPS, track, GPX) |
| `recharts` | 2.x | Elevation chart |
| `next-pwa` | 5.x | PWA + Service Worker via Workbox |

### External APIs (Gratis)
| API | Kegunaan | Limit |
|-----|----------|-------|
| OpenStreetMap Tiles | Tile peta standar | Unlimited (fair use) |
| OpenTopoMap | Tile topografi | Unlimited (fair use) |
| Open-Elevation API | Elevasi akurat dari koordinat | Unlimited (self-hostable) |
| Esri World Imagery | Tile satelit | Unlimited |

### Penyimpanan Data
- **IndexedDB** (via `idb`) — Simpan rute, waypoint, dan history tracking di browser
- **Cache API** (via Workbox) — Cache tile peta untuk offline

### DevOps
- **Vercel** — Hosting & CI/CD
- **GitHub Actions** — Lint + type-check sebelum deploy (opsional)

---

## 📁 Struktur Folder

```
trailnav/
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout + PWA meta tags
│   ├── page.tsx                  # Halaman utama (map view)
│   ├── globals.css               # Global styles + Tailwind imports
│   └── manifest.json             # PWA Web App Manifest
│
├── components/
│   ├── Map/
│   │   ├── MapContainer.tsx      # Leaflet map wrapper (dynamic import)
│   │   ├── LocationMarker.tsx    # Marker GPS dengan animasi pulse
│   │   ├── AccuracyCircle.tsx    # Lingkaran akurasi GPS
│   │   ├── GPXLayer.tsx          # Render polyline + waypoint dari GPX
│   │   └── TrackLayer.tsx        # Render polyline tracking real-time
│   │
│   ├── UI/
│   │   ├── StatsPanel.tsx        # Panel kiri: koordinat, elevasi, stats
│   │   ├── ElevationChart.tsx    # Grafis profil elevasi (Recharts)
│   │   ├── Toolbar.tsx           # Bottom toolbar: tombol aksi
│   │   ├── TopBar.tsx            # Logo + GPS status chip
│   │   ├── LayerSwitcher.tsx     # Dropdown pilihan layer peta
│   │   ├── GPXModal.tsx          # Modal import/export GPX
│   │   ├── CoordBar.tsx          # Bar koordinat kursor/posisi
│   │   └── Toast.tsx             # Notifikasi sementara
│   │
│   └── hooks/
│       ├── useGPS.ts             # Geolocation API + watch position
│       ├── useTracking.ts        # Record track, kalkulasi stats
│       ├── useGPX.ts             # Parse GPX input, generate GPX output
│       ├── useElevation.ts       # Query Open-Elevation API
│       └── useOfflineDB.ts       # IndexedDB via idb (simpan rute)
│
├── store/
│   └── mapStore.ts               # Zustand store (global state)
│
├── lib/
│   ├── gpxParser.ts              # Parse XML GPX → TrackPoint[]
│   ├── gpxExporter.ts            # TrackPoint[] → GPX XML string
│   ├── elevation.ts              # Batch query Open-Elevation API
│   ├── geo.ts                    # Haversine, formatCoord, bearing
│   └── tileCache.ts              # Helper Workbox tile caching
│
├── types/
│   └── index.ts                  # Type definitions (TrackPoint, Waypoint, GPXData)
│
├── public/
│   ├── manifest.json             # PWA manifest (icons, theme, display)
│   ├── sw.js                     # Service Worker (di-generate next-pwa)
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
│
├── next.config.js                # Next.js config + next-pwa setup
├── tailwind.config.ts            # Tailwind config + custom theme
├── tsconfig.json
├── .env.local.example            # Template environment variables
└── package.json
```

---

## ✅ Prasyarat

Pastikan sudah terinstall:

```bash
node --version   # >= 18.17.0
npm --version    # >= 9.x
git --version    # >= 2.x
```

---

## 🚀 Instalasi & Setup Lokal

### 1. Clone Repository

```bash
git clone https://github.com/USERNAME/trailnav.git
cd trailnav
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` (lihat bagian [Environment Variables](#-environment-variables)).

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

> ⚠️ **Catatan GPS:** Browser membutuhkan HTTPS untuk akses Geolocation API di production. Di localhost, GPS tetap bisa diakses tanpa HTTPS.

### 5. Build Production

```bash
npm run build
npm start
```

---

## 🔐 Environment Variables

Buat file `.env.local` di root project:

```env
# ─── Open-Elevation API ───────────────────────────────────────
# Gunakan public endpoint (gratis, no key required)
NEXT_PUBLIC_ELEVATION_API_URL=https://api.open-elevation.com/api/v1/lookup

# Atau self-host Open-Elevation (recommended untuk production):
# https://github.com/Jorl17/open-elevation
# NEXT_PUBLIC_ELEVATION_API_URL=https://your-elevation-instance.com/api/v1/lookup

# ─── Mapbox (Opsional — untuk tile premium) ───────────────────
# Kosongkan jika pakai OSM gratis
NEXT_PUBLIC_MAPBOX_TOKEN=

# ─── App Config ───────────────────────────────────────────────
NEXT_PUBLIC_APP_NAME=TrailNav
NEXT_PUBLIC_APP_URL=https://trailnav.vercel.app
```

> ℹ️ Semua variabel yang diawali `NEXT_PUBLIC_` akan di-expose ke client. Jangan simpan secret di sini.

---

## 🌐 Deploy ke Vercel

### Metode 1: Via Vercel Dashboard (Recommended)

**Step 1 — Push ke GitHub**
```bash
git add .
git commit -m "initial commit"
git push origin main
```

**Step 2 — Import di Vercel**
1. Buka [vercel.com/new](https://vercel.com/new)
2. Klik **"Import Git Repository"**
3. Pilih repo `trailnav`
4. Framework preset akan terdeteksi otomatis sebagai **Next.js**

**Step 3 — Set Environment Variables**

Di halaman konfigurasi deployment, tambahkan:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_ELEVATION_API_URL` | `https://api.open-elevation.com/api/v1/lookup` |
| `NEXT_PUBLIC_APP_URL` | `https://trailnav.vercel.app` |

**Step 4 — Deploy**

Klik **"Deploy"**. Vercel akan otomatis:
- Mendeteksi Next.js
- Menjalankan `npm run build`
- Deploy ke Edge Network global
- Memberikan URL seperti `https://trailnav.vercel.app`

---

### Metode 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (dari root project)
vercel

# Deploy ke production
vercel --prod
```

---

### Auto-Deploy (CI/CD)

Setelah repo terhubung ke Vercel, setiap `git push` ke branch `main` akan otomatis trigger deployment baru. Branch lain akan mendapat **Preview URL** tersendiri.

```
main branch     → https://trailnav.vercel.app         (production)
feature/xyz     → https://trailnav-git-feature-xyz.vercel.app  (preview)
```

---

## 📱 PWA & Offline Setup

### Konfigurasi `next.config.js`

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    // ─── OSM Tiles ─────────────────────────────────
    {
      urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'osm-tiles',
        expiration: {
          maxEntries: 500,        // Maks 500 tiles tersimpan
          maxAgeSeconds: 30 * 24 * 60 * 60,  // 30 hari
        },
      },
    },
    // ─── OpenTopoMap Tiles ──────────────────────────
    {
      urlPattern: /^https:\/\/[abc]\.tile\.opentopomap\.org\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'topo-tiles',
        expiration: { maxEntries: 300, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    // ─── Elevation API ──────────────────────────────
    {
      urlPattern: /^https:\/\/api\.open-elevation\.com\/.*/,
      handler: 'NetworkFirst',   // Coba network dulu, fallback ke cache
      options: {
        cacheName: 'elevation-api',
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    // ─── App Shell ──────────────────────────────────
    {
      urlPattern: /^https:\/\/trailnav\.vercel\.app\/.*/,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'app-shell' },
    },
  ],
});

module.exports = withPWA({ /* next config */ });
```

### Web App Manifest (`public/manifest.json`)

```json
{
  "name": "TrailNav — Navigasi Medan",
  "short_name": "TrailNav",
  "description": "GPS tracking, GPX import/export, dan profil elevasi untuk pendaki",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0d0f",
  "theme_color": "#00e5a0",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

### Cara Install PWA di Device

**Android (Chrome):**
1. Buka `https://trailnav.vercel.app` di Chrome
2. Tap ikon menu (⋮) → "Add to Home Screen"
3. Tap "Install"

**iOS (Safari):**
1. Buka di Safari
2. Tap tombol Share → "Add to Home Screen"

**Desktop (Chrome/Edge):**
1. Klik ikon install (⊕) di address bar

---

## 🧩 Arsitektur Komponen

```
app/page.tsx
└── MapContainer (dynamic, ssr: false)
    ├── TileLayer (OSM/Topo/Satellite/Terrain)
    ├── LocationMarker + AccuracyCircle
    ├── TrackLayer (polyline tracking aktif)
    └── GPXLayer (polyline + markers dari file GPX)

app/page.tsx (UI overlay)
├── TopBar
│   ├── Logo
│   └── GPSChip (status + center button)
├── StatsPanel (kiri)
│   ├── KoordinatDisplay
│   ├── ElevasiDisplay
│   └── StatistikTracking
├── MapControls (kanan)
│   ├── LayerSwitcher
│   ├── ZoomIn / ZoomOut
│   └── CompassButton
├── ElevationChart (bawah, muncul saat ada GPX)
├── Toolbar (bottom)
│   ├── TrackButton
│   ├── GPXButton
│   ├── WaypointButton
│   ├── CenterButton
│   └── ClearButton
└── GPXModal (overlay)
    ├── FileDropzone
    ├── LoadDemoButton
    └── ExportButton
```

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────┐
│                  USER ACTIONS                   │
└────────────┬────────────────────┬───────────────┘
             │                    │
      Start Tracking          Load GPX File
             │                    │
             ▼                    ▼
    useGPS.ts hook          useGPX.ts hook
    (watchPosition)         (parse XML)
             │                    │
             ▼                    ▼
    useTracking.ts          useElevation.ts
    (record points,         (batch query
    calc distance,          Open-Elevation API)
    gain/loss)                    │
             │                    │
             └──────────┬─────────┘
                        ▼
                  mapStore.ts (Zustand)
                  ├── trackPoints[]
                  ├── gpxData
                  ├── currentPosition
                  ├── stats (dist, gain, loss)
                  └── uiState
                        │
              ┌─────────┼─────────┐
              ▼         ▼         ▼
        MapContainer  StatsPanel  ElevationChart
        (re-render)   (update)    (re-draw)
```

---

## 📡 API Reference

### Open-Elevation API

Digunakan untuk mendapatkan elevasi akurat dari koordinat lat/lon.

**Endpoint:** `POST https://api.open-elevation.com/api/v1/lookup`

**Request:**
```json
{
  "locations": [
    { "latitude": -7.797068, "longitude": 110.370529 },
    { "latitude": -7.541000, "longitude": 110.446000 }
  ]
}
```

**Response:**
```json
{
  "results": [
    { "latitude": -7.797068, "longitude": 110.370529, "elevation": 114 },
    { "latitude": -7.541000, "longitude": 110.446000, "elevation": 867 }
  ]
}
```

**Implementasi di `lib/elevation.ts`:**
```typescript
export async function getElevationBatch(
  points: { lat: number; lon: number }[]
): Promise<number[]> {
  // Chunk ke 100 titik per request (limit API)
  const chunks = chunkArray(points, 100);
  const results: number[] = [];

  for (const chunk of chunks) {
    const res = await fetch(process.env.NEXT_PUBLIC_ELEVATION_API_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locations: chunk.map(p => ({ latitude: p.lat, longitude: p.lon }))
      })
    });
    const data = await res.json();
    results.push(...data.results.map((r: any) => r.elevation));
  }

  return results;
}
```

---

## 🗺️ GPX Format Reference

TrailNav mendukung GPX 1.0 dan 1.1. Struktur yang didukung:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TrailNav">

  <!-- Track (hasil recording) -->
  <trk>
    <name>Pendakian Merapi 2025</name>
    <trkseg>
      <trkpt lat="-7.541" lon="110.446">
        <ele>867</ele>
        <time>2025-01-01T08:00:00Z</time>
      </trkpt>
      <!-- ... more points ... -->
    </trkseg>
  </trk>

  <!-- Waypoints -->
  <wpt lat="-7.540" lon="110.445">
    <name>Pos 1</name>
    <ele>1200</ele>
  </wpt>

</gpx>
```

---

## 📍 Tipe Data (TypeScript)

```typescript
// types/index.ts

export interface TrackPoint {
  lat: number;
  lon: number;
  ele: number;        // Elevasi dalam meter
  time?: Date;
  speed?: number;     // m/s
  accuracy?: number;  // meter
}

export interface Waypoint {
  id: string;
  lat: number;
  lon: number;
  name: string;
  ele?: number;
  createdAt: Date;
}

export interface GPXData {
  name?: string;
  trackPoints: TrackPoint[];
  waypoints: Waypoint[];
  stats: {
    totalDistance: number;   // meter
    elevationGain: number;   // meter
    elevationLoss: number;   // meter
    maxElevation: number;    // meter
    minElevation: number;    // meter
    duration?: number;       // detik
  };
}

export interface MapStore {
  // GPS State
  currentPosition: GeolocationCoordinates | null;
  isGPSActive: boolean;
  gpsAccuracy: number;

  // Tracking State
  isTracking: boolean;
  trackPoints: TrackPoint[];
  trackStartTime: Date | null;
  trackDistance: number;
  elevationGain: number;
  elevationLoss: number;

  // GPX State
  gpxData: GPXData | null;

  // UI State
  activeLayer: 'osm' | 'topo' | 'satellite' | 'terrain';
  waypoints: Waypoint[];
}
```

---

## 🛣️ Roadmap

### v1.0 — MVP (sekarang)
- [x] GPS tracking + statistik real-time
- [x] Import GPX (visualisasi + profil elevasi)
- [x] Export GPX dari tracking session
- [x] PWA offline dengan tile caching
- [x] Multi-layer peta (OSM, Topo, Satelit, Terrain)
- [x] Waypoint management

### v1.1 — Storage
- [ ] Simpan riwayat tracking ke IndexedDB
- [ ] Daftar rute tersimpan
- [ ] Hapus / rename rute
- [ ] Preview thumbnail rute

### v2.0 — Cloud Sync (Supabase)
- [ ] Auth (Google OAuth + magic link)
- [ ] Sync rute ke cloud (Supabase + PostGIS)
- [ ] Sharing rute via public link
- [ ] Dashboard statistik kumulatif

### v2.1 — Advanced Features
- [ ] 3D terrain view (MapLibre GL)
- [ ] Turn-by-turn navigation sepanjang rute GPX
- [ ] Alert keluar dari jalur
- [ ] Export ke format KML / GeoJSON

---

## 🤝 Kontribusi

1. Fork repo ini
2. Buat branch fitur: `git checkout -b feature/nama-fitur`
3. Commit: `git commit -m 'feat: tambah fitur xyz'`
4. Push: `git push origin feature/nama-fitur`
5. Buat Pull Request

### Commit Convention
```
feat:     Fitur baru
fix:      Bug fix
docs:     Perubahan dokumentasi
style:    Formatting, tanpa perubahan logic
refactor: Refactor kode
perf:     Peningkatan performa
test:     Tambah atau fix test
```

---

## 📄 Lisensi

MIT License — bebas digunakan, dimodifikasi, dan didistribusikan.

---

<div align="center">
  <b>TrailNav</b> — Dibuat untuk para pendaki 🏔️<br>
  <a href="https://trailnav.vercel.app">Demo</a> · 
  <a href="https://github.com/USERNAME/trailnav/issues">Report Bug</a> · 
  <a href="https://github.com/USERNAME/trailnav/issues">Request Feature</a>
</div>
