/**
 * MÓDULO: CONFIGURACIÓN CENTRALIZADA
 * 
 * USO: 
 * import { MAP_CONFIG, COLORS } from './src-refactored/config.js';
 */

export const MAP_CONFIG = {
  center: [-32.9337, -68.8978],
  zoom: 13,
  minZoom: 10,
  maxZoom: 18,
  maxBounds: [[-33.2, -69.2], [-32.6, -68.6]],
  zoomAnimation: true,
  fadeAnimation: true,
  markerZoomAnimation: true,
};

export const TILE_LAYERS = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    options: { maxZoom: 19 },
  },
  argenmap: {
    name: 'ArgEnMap (IGN)',
    url: 'https://wms.ign.gob.ar/geoserver/capabaseargenmap/gwc/service/wmts?',
    attribution: 'IGN - Argenmap v2',
    options: { maxZoom: 18 },
  },
  satellite: {
    name: 'Satellite (ArcGIS)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    options: { maxZoom: 18 },
  },
};

export const GEOCODER_CONFIG = {
  apiKey: 'AAPK2a3d19d93e504102bbcf74c44d0f102bQ2cZ2PdwTUD_Y_EyWj1bDTnWECSMJinF58T6J2OczD7lzOLAJJ8IOJ5R1I1ySl9x',
  position: 'topleft',
  placeholder: 'Ingresar dirección',
  nearby: {
    lat: -32.9337,
    lng: -68.8978,
  },
};

export const CLUSTER_CONFIG = {
  maxClusterRadius: 80,
  disableClusteringAtZoom: 16,
  showCoverageOnHover: true,
  zoomToBoundsOnClick: true,
};

export const COLORS = {
  primary: '#800080',
  secondary: '#1f77b4',
  success: '#2ca02c',
  danger: '#d62728',
  warning: '#ff7f0e',
  info: '#17becf',
};

export const LAYER_CATEGORIES = {
  infrastructure: 'Infraestructura',
  transportation: 'Transporte',
  services: 'Servicios',
  environment: 'Ambiente',
  planning: 'Planificación',
  utilities: 'Servicios Básicos',
};

// Configuración de capas específicas del municipio
export const LAYERS_CONFIG = {
  cicloviasExistentes: {
    name: 'Ciclovías Existentes',
    category: 'transportation',
    dataUrl: 'scripts/CicloviasExistentes.js',
    style: { color: '#FF5722', weight: 3, opacity: 0.8 },
    cluster: false,
    popup: true,
  },
  cicloviasDami: {
    name: 'Ciclovías Proyectadas',
    category: 'transportation',
    dataUrl: 'scripts/Ciclovias Proyectadas (DAMI II).js',
    style: { color: '#2196F3', weight: 2, opacity: 0.6, dashArray: '5, 5' },
    cluster: false,
    popup: true,
  },
  edificios: {
    name: 'Edificios',
    category: 'infrastructure',
    dataUrl: 'scripts/Edificios.js',
    style: { color: '#9C27B0', weight: 1, opacity: 0.7 },
    cluster: true,
    popup: true,
  },
  barrios: {
    name: 'Barrios',
    category: 'planning',
    dataUrl: 'scripts/Barrios.js',
    style: { color: '#673AB7', weight: 2, opacity: 0.5, fillOpacity: 0.1 },
    cluster: false,
    popup: true,
  },
  // Agregar más según sea necesario...
};

