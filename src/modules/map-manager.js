import L from 'leaflet';
import LayerManager from './modules/layer-manager';
import { MAP_CONFIG, TILE_LAYERS } from './config';

export default class MapManager {
  constructor() {
    this.map = null;
    this.layerManager = null;
  }

  async initialize() {
    // Crear instancia del mapa
    this.map = L.map('map', {
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.zoom,
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
    });

    // Agregar tile layer por defecto
    const osmLayer = L.tileLayer(TILE_LAYERS.osm.url, {
      attribution: TILE_LAYERS.osm.attribution,
    });
    osmLayer.addTo(this.map);

    // Inicializar gestor de capas
    this.layerManager = new LayerManager(this.map);

    return this.map;
  }

  getMap() {
    return this.map;
  }

  getLayerManager() {
    return this.layerManager;
  }
}
