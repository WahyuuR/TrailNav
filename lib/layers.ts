import type { LayerConfig } from '@/types'

export const LAYER_CONFIGS: LayerConfig[] = [
  {
    id: 'osm',
    label: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 19,
    color: '#4caf50',
  },
  {
    id: 'topo',
    label: 'Topografi',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
    color: '#ff9800',
  },
  {
    id: 'satellite',
    label: 'Satelit',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© <a href="https://esri.com">Esri</a>',
    maxZoom: 19,
    color: '#2196f3',
  },
  {
    id: 'terrain',
    label: 'Terrain',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png',
    attribution: '© <a href="https://stamen.com">Stamen Design</a>',
    maxZoom: 18,
    color: '#9c27b0',
  },
]

export const DEFAULT_CENTER: [number, number] = [-7.797068, 110.370529] // Yogyakarta
export const DEFAULT_ZOOM = 13
