/**
 * MÓDULO: GESTOR DE CAPAS (Layer Manager)
 *
 * RESPONSABILIDADES:
 * - Carga de GeoJSON bajo demanda (lazy loading)
 * - Aplicación de estilos y clustering
 * - Manejo de eventos (click, hover)
 * - Control de visibilidad
 *
 * EJEMPLO DE USO:
 *
 * const layerManager = new LayerManager(map);
 *
 * // Cargar una capa
 * await layerManager.loadLayer('cicloviasExistentes', {
 *   name: 'Ciclovías Existentes',
 *   dataUrl: 'scripts/CicloviasExistentes.js',
 *   style: { color: '#FF5722', weight: 3 },
 *   cluster: false,
 *   popup: true,
 * });
 *
 * // Alternar visibilidad
 * layerManager.toggleLayer('cicloviasExistentes', false);
 *
 * // Obtener información de capas
 * console.log(layerManager.listLayers());
 */

import L from 'leaflet';
import 'leaflet-markercluster';
import 'leaflet-markercluster/dist/MarkerCluster.css';
import 'leaflet-markercluster/dist/MarkerCluster.Default.css';

class LayerManager {
  constructor(map) {
    this.map = map;
    this.layers = new Map();
    this.clusterGroups = new Map();
    this.loadingStates = new Map();
  }

  /**
   * Carga una capa GeoJSON desde una URL o variable global
   * @param {string} layerId - ID único de la capa
   * @param {object} config - Configuración: { name, dataUrl, style, cluster, popup }
   */
  async loadLayer(layerId, config) {
    // Evitar duplicados
    if (this.layers.has(layerId)) {
      console.warn(`⚠️ Layer ${layerId} already loaded`);
      return this.layers.get(layerId).layer;
    }

    try {
      this.setLoadingState(layerId, true);
      console.log(`📥 Loading layer: ${config.name}`);

      // Cargar datos GeoJSON
      let geoJsonData = await this.loadGeoJson(config.dataUrl);

      // Si no es un Feature Collection válido, ajustar
      if (geoJsonData && !geoJsonData.features) {
        geoJsonData = { type: 'FeatureCollection', features: geoJsonData };
      }

      if (!geoJsonData || !geoJsonData.features) {
        throw new Error('Invalid GeoJSON format');
      }

      // Crear layer (con clustering si aplica)
      let geoJsonLayer;
      if (config.cluster && geoJsonData.features.length > 50) {
        geoJsonLayer = this.createClusteredLayer(geoJsonData, config);
      } else {
        geoJsonLayer = this.createGeoJsonLayer(geoJsonData, config);
      }

      // Almacenar referencia
      this.layers.set(layerId, {
        layer: geoJsonLayer,
        config,
        data: geoJsonData,
        visible: true,
      });

      // Agregar al mapa
      geoJsonLayer.addTo(this.map);
      this.setLoadingState(layerId, false);

      console.log(`✅ Layer loaded: ${config.name} (${geoJsonData.features.length} features)`);
      return geoJsonLayer;
    } catch (error) {
      console.error(`❌ Error loading layer ${layerId}:`, error);
      this.setLoadingState(layerId, false);
      throw error;
    }
  }

  /**
   * Crea una capa GeoJSON estándar
   */
  createGeoJsonLayer(geoJsonData, config) {
    const styleOptions = config.style || {
      color: '#800080',
      weight: 2,
      opacity: 0.8,
    };

    return L.geoJSON(geoJsonData, {
      style: (feature) => (config.styleFunction
        ? config.styleFunction(feature)
        : styleOptions),
      pointToLayer: (feature, latlng) => {
        if (config.icon) {
          return L.marker(latlng, { icon: config.icon });
        }
        return L.circleMarker(latlng, styleOptions);
      },
      onEachFeature: (feature, layer) => {
        if (config.popup) {
          const popupContent = this.createPopupContent(feature.properties);
          layer.bindPopup(popupContent);
        }

        // Eventos personalizados
        if (config.onEachFeature) {
          config.onEachFeature(feature, layer);
        }
      },
    });
  }

  /**
   * Crea una capa con clustering de puntos
   */
  createClusteredLayer(geoJsonData, config) {
    const markerClusterGroup = L.markerClusterGroup({
      maxClusterRadius: 80,
      disableClusteringAtZoom: 16,
      showCoverageOnHover: true,
    });

    L.geoJSON(geoJsonData, {
      pointToLayer: (feature, latlng) => {
        const marker = config.icon
          ? L.marker(latlng, { icon: config.icon })
          : L.marker(latlng);

        if (config.popup) {
          marker.bindPopup(this.createPopupContent(feature.properties));
        }

        return marker;
      },
    }).addTo(markerClusterGroup);

    this.clusterGroups.set(config.name, markerClusterGroup);
    return markerClusterGroup;
  }

  /**
   * Crea contenido HTML para popup
   */
  createPopupContent(properties) {
    let html = '<div class="popup-content"><table class="popup-table">';

    Object.entries(properties).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        const displayKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase())
          .trim();

        html += `<tr><td><strong>${displayKey}:</strong></td><td>${value}</td></tr>`;
      }
    });

    html += '</table></div>';
    return html;
  }

  /**
   * Carga GeoJSON desde URL o variable global
   */
  async loadGeoJson(dataUrl) {
    // Si es una URL HTTP
    if (dataUrl.startsWith('http')) {
      try {
        const response = await fetch(dataUrl);
        return await response.json();
      } catch (error) {
        console.error(`Error fetching ${dataUrl}:`, error);
        throw error;
      }
    }

    // Si es una variable global (scripts/Edificios.js, etc)
    // Extraer nombre de variable
    const varName = dataUrl
      .replace(/.*\/(.*?)\.js.*/, '$1')
      .replace(/[-_]/g, '');

    if (window[varName]) {
      return window[varName];
    }

    // Intentar cargar el script
    try {
      await this.loadScript(dataUrl);
      if (window[varName]) {
        return window[varName];
      }
    } catch (error) {
      console.error(`Could not load ${dataUrl}:`, error);
    }

    throw new Error(`Cannot load GeoJSON from ${dataUrl}`);
  }

  /**
   * Carga un script dinámicamente
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  /**
   * Alterna visibilidad de una capa
   */
  toggleLayer(layerId, visible) {
    const layerData = this.layers.get(layerId);
    if (layerData) {
      if (visible) {
        this.map.addLayer(layerData.layer);
        layerData.visible = true;
      } else {
        this.map.removeLayer(layerData.layer);
        layerData.visible = false;
      }
      console.log(`👁️ Layer ${layerId} visibility: ${visible}`);
    }
  }

  /**
   * Elimina una capa del mapa
   */
  removeLayer(layerId) {
    const layerData = this.layers.get(layerId);
    if (layerData) {
      this.map.removeLayer(layerData.layer);
      this.layers.delete(layerId);
      console.log(`🗑️ Layer removed: ${layerId}`);
    }
  }

  /**
   * Lista todas las capas cargadas
   */
  listLayers() {
    return Array.from(this.layers.entries()).map(([id, data]) => ({
      id,
      name: data.config.name,
      visible: data.visible,
      features: data.data.features.length,
      status: this.loadingStates.get(id) ? 'loading' : 'ready',
    }));
  }

  /**
   * Obtiene una capa por ID
   */
  getLayer(layerId) {
    return this.layers.get(layerId)?.layer;
  }

  /**
   * Establece estado de carga
   */
  setLoadingState(layerId, loading) {
    this.loadingStates.set(layerId, loading);
    // Emitir evento para mostrar indicador visual
    window.dispatchEvent(new CustomEvent('layerLoadingStateChange', {
      detail: { layerId, loading },
    }));
  }
}

export { LayerManager };
