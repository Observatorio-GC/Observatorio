import { createHeightOutlineLayer } from './contornos-3d.js';
import { mergeTiles, tileKeysForBounds } from './ciudad-3d-data.js';
import { MODELS_3D, withoutCoveredPolygons, createChurchModelLayer } from './iglesia-3d.js';

const bases = {
	'OpenStreetMap': {
		url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
		maxzoom: 19, attribution: '&copy; OpenStreetMap contributors'
	},
	'Google Satelital': {
		url: 'https://mt0.google.com/vt/lyrs=s&hl=es&x={x}&y={y}&z={z}',
		maxzoom: 20, attribution: '&copy; Google'
	},
	'ESRI Satelital': {
		url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
		maxzoom: 20, attribution: '&copy; Esri'
	}
};

const empty = () => ({ type: 'FeatureCollection', features: [] });
const CITY_CENTER = [-68.844306, -32.925132];
export const initial3DZoom = (zoom) => Math.max(16, zoom - 1);
export const return2DZoom = (zoom, openedZoom, previousZoom) =>
	Math.abs(zoom - openedZoom) < 0.001 ? previousZoom : zoom + 1;

function loadScript(src) {
	return new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.src = src;
		script.onload = resolve;
		script.onerror = () => {
			script.remove();
			reject(new Error(`No se pudo cargar ${src}`));
		};
		document.head.appendChild(script);
	});
}

export function initCity3D(map, baseMaps) {
	const container = document.getElementById('ciudad-3d');
	const status = document.getElementById('ciudad-3d-status');
	const baseSelect = document.getElementById('ciudad-3d-base');
	const closeButton = document.getElementById('ciudad-3d-close');
	const button = document.getElementById('btn-ciudad-3d');
	const infoPanel = document.getElementById('building-info');
	const infoTitle = document.getElementById('building-info-title');
	const infoContent = document.getElementById('building-info-content');
	const infoClose = document.getElementById('building-info-close');
	let view, outlines, availableTiles;
	const tileCache = new Map();
	const modelLayers = new Map();
	const modelErrors = new Set();
	let ready = false;
	let active = false;
	let outlineError = false;
	let modelsLoading;
	let generation = 0;
	let loading;
	let initial2DZoom;
	let initial2DCenter;
	let opened3DZoom;
	let refreshVersion = 0;

	function selectBase() {
		if (ready) Object.keys(bases).forEach((name) => {
			view.setLayoutProperty(`base-${name}`, 'visibility', name === baseSelect.value ? 'visible' : 'none');
		});
	}

	function modelErrorMessage() {
		return modelErrors.size
			? ` No se pudieron cargar estos modelos: ${Array.from(modelErrors).join(', ')}. Volvé a 2D y reintentá.`
			: '';
	}

	function showBuildingInfo(model) {
		infoTitle.textContent = model.name;
		infoContent.replaceChildren();
		if (model.description) {
			const description = document.createElement('p');
			description.textContent = model.description;
			infoContent.appendChild(description);
		}
		const list = document.createElement('dl');
		list.className = 'building-info-list';
		[
			['Estatus', model.status],
			['Inauguración', model.inauguration],
			['Estilo', model.style],
			['Ubicación', model.location]
		].filter(([, value]) => value).forEach(([label, value]) => {
			const row = document.createElement('div');
			const term = document.createElement('dt');
			const detail = document.createElement('dd');
			term.textContent = label;
			detail.textContent = value;
			row.append(term, detail);
			list.appendChild(row);
		});
		if (list.childElementCount) infoContent.appendChild(list);
		infoContent.hidden = !infoContent.childElementCount;
		infoPanel.hidden = false;
	}

	async function loadTile(key) {
		if (!tileCache.has(key)) {
			const request = fetch(`data/ciudad-3d/${key}.json`).then((response) => {
				if (!response.ok) throw new Error(`No se pudo cargar la zona ${key}: HTTP ${response.status}`);
				return response.json();
			}).then((data) => {
				if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
					throw new Error(`La zona ${key} no contiene datos válidos.`);
				}
				return data;
			}).catch((error) => {
				tileCache.delete(key);
				throw error;
			});
			tileCache.set(key, request);
		}
		return tileCache.get(key);
	}

	async function refresh() {
		if (!active || !ready || !availableTiles) return;
		const version = ++refreshVersion;
		const bounds = view.getBounds();
		if (view.getZoom() < 14) {
			view.getSource('buildings').setData(empty());
			if (outlines) outlines.setFeatures([]);
			status.textContent = 'Acercá el mapa para ver las edificaciones.';
			status.textContent += modelErrorMessage();
			return;
		}
		const visibleBounds = [
			bounds.getWest() - 0.002, bounds.getSouth() - 0.002,
			bounds.getEast() + 0.002, bounds.getNorth() + 0.002
		];
		const keys = tileKeysForBounds(visibleBounds).filter((key) => availableTiles.has(key));
		status.textContent = 'Cargando edificaciones visibles...';
		try {
			const tiles = await Promise.all(keys.map(loadTile));
			if (!active || version !== refreshVersion) return;
			const features = mergeTiles(tiles, visibleBounds)
				.map((feature) => withoutCoveredPolygons(feature, modelLayers)).filter(Boolean);
			view.getSource('buildings').setData({ type: 'FeatureCollection', features });
			if (outlines) outlines.setFeatures(features);
			status.textContent = 'Edificaciones existentes según los datos disponibles. Las construcciones sin altura se muestran planas.';
			if (outlineError) status.textContent += ' No se pudieron mostrar los contornos.';
			status.textContent += modelErrorMessage();
			for (const key of tileCache.keys()) {
				if (tileCache.size <= Math.max(32, keys.length)) break;
				if (!keys.includes(key)) tileCache.delete(key);
			}
		} catch (error) {
			console.error('No se pudieron cargar las edificaciones:', error);
			if (active && version === refreshVersion) {
				view.getSource('buildings').setData(empty());
				if (outlines) outlines.setFeatures([]);
				status.textContent = 'No se pudieron cargar las edificaciones. Revisá la conexión y mové el mapa para reintentar.';
			}
		}
	}

	async function loadModels() {
		if (modelsLoading) return modelsLoading;
		modelsLoading = (async () => {
			if (!window.THREE) await loadScript('js/threejs/three.min.js');
			if (!window.THREE.GLTFLoader) await loadScript('js/threejs/GLTFLoader.js');
			await Promise.all(MODELS_3D.filter((config) => !modelLayers.has(config.id)).map(async (config) => {
				try {
					const model = await new Promise((resolve, reject) => {
						new THREE.GLTFLoader().load(`data/modelos-3d/${config.id}.glb`,
							(gltf) => resolve(gltf.scene), undefined, reject);
					});
					const layer = createChurchModelLayer(model, config);
					view.addLayer(layer, 'selected-building');
					modelLayers.set(config.id, layer);
					modelErrors.delete(config.name);
				} catch (error) {
					modelErrors.add(config.name);
					console.error(`No se pudo cargar el modelo 3D de ${config.name}:`, error);
				}
				refresh();
			}));
		})().catch((error) => {
			MODELS_3D.filter((config) => !modelLayers.has(config.id))
				.forEach((config) => modelErrors.add(config.name));
			console.error('No se pudieron cargar las bibliotecas de los modelos 3D:', error);
			refresh();
		}).finally(() => { modelsLoading = null; });
		return modelsLoading;
	}

	function createView() {
		const style = { version: 8, sources: {}, layers: [] };
		Object.entries(bases).forEach(([name, base]) => {
			style.sources[name] = { type: 'raster', tiles: [base.url], tileSize: 256,
				maxzoom: base.maxzoom, attribution: base.attribution };
			style.layers.push({ id: `base-${name}`, type: 'raster', source: name,
				layout: { visibility: name === baseSelect.value ? 'visible' : 'none' } });
		});
		style.sources.buildings = { type: 'geojson', data: empty(), maxzoom: 22, buffer: 256, tolerance: 0 };
		style.sources.selected = { type: 'geojson', data: empty() };
		style.layers.push(
			{ id: 'flat-buildings', type: 'fill', source: 'buildings', filter: ['==', ['get', 'height'], 0],
				paint: { 'fill-color': '#c9c9c9', 'fill-opacity': 0.7, 'fill-outline-color': '#555' } },
			{ id: 'height-buildings', type: 'fill-extrusion', source: 'buildings',
				filter: ['>', ['get', 'height'], 0], paint: {
					'fill-extrusion-color': '#deb887', 'fill-extrusion-height': ['get', 'height'],
					'fill-extrusion-opacity': 0.9
				} },
			{ id: 'selected-building', type: 'line', source: 'selected',
				paint: { 'line-color': '#e00000', 'line-width': 3 } }
		);
		view = new maplibregl.Map({
			container: 'ciudad-3d-map', style, center: CITY_CENTER,
			zoom: opened3DZoom, pitch: 60, maxPitch: 80, maxZoom: 22,
			attributionControl: false, locale: {
				'NavigationControl.ZoomIn': 'Acercar',
				'NavigationControl.ZoomOut': 'Alejar',
				'NavigationControl.ResetBearing': 'Orientar hacia el norte'
			}
		});
		view.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'top-left');
		view.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
		view.on('load', () => {
			try {
				outlines = createHeightOutlineLayer(view.getCenter());
				view.addLayer(outlines, 'selected-building');
			} catch (error) {
				outlines = null;
				outlineError = true;
				console.error('No se pudieron cargar los contornos 3D:', error);
			}
			ready = true;
			selectBase();
			refresh();
			loadModels();
		});
		view.on('moveend', refresh);
		view.on('error', (event) => {
			console.error('Error en la vista 3D:', event.error);
			status.textContent = 'No se pudo cargar parte de la vista 3D. Revisá la conexión.';
		});
		view.on('click', (event) => {
			if (!ready) return;
			const clickedModel = MODELS_3D.find((config) => {
				const layer = modelLayers.get(config.id);
				return layer && layer.pick(event.point);
			});
			if (clickedModel) {
				view.getSource('selected').setData(empty());
				if (outlines) outlines.setSelected(null, 0);
				if (clickedModel.showInfo === false) infoPanel.hidden = true;
				else showBuildingInfo(clickedModel);
				return;
			}
			const [feature] = view.queryRenderedFeatures(event.point, { layers: ['height-buildings', 'flat-buildings'] });
			view.getSource('selected').setData(feature || empty());
			if (outlines) outlines.setSelected(feature || null, feature ? Number(feature.properties.height) : 0);
		});
	}

	async function open() {
		active = true;
		const current = ++generation;
		initial2DZoom = map.getZoom();
		initial2DCenter = map.getCenter();
		opened3DZoom = initial3DZoom(initial2DZoom);
		Object.keys(baseMaps).forEach((name) => {
			if (map.hasLayer(baseMaps[name])) baseSelect.value = name;
		});
		container.hidden = false;
		map.getContainer().setAttribute('inert', '');
		button.setAttribute('aria-pressed', 'true');
		status.textContent = 'Cargando vista 3D y edificaciones...';
		closeButton.focus();
		try {
			if (!loading) {
				loading = Promise.all([
					window.maplibregl ? Promise.resolve() : loadScript('js/maplibre-gl.js'),
					fetch('data/ciudad-3d/manifest.json').then((response) => {
						if (!response.ok) throw new Error(`No se pudo cargar el índice 3D: HTTP ${response.status}`);
						return response.json();
					})
				]).then(([, manifest]) => {
					if (!Array.isArray(manifest.tiles) || !manifest.tiles.every((key) => /^-?\d+_-?\d+$/.test(key))) {
						throw new Error('El índice de edificaciones no es válido.');
					}
					availableTiles = new Set(manifest.tiles);
				}).catch((error) => { loading = null; throw error; });
			}
			await loading;
			if (!active || current !== generation) return;
			if (!view) createView();
			else {
				view.jumpTo({ center: CITY_CENTER, zoom: opened3DZoom,
					pitch: view.getPitch() || 60 });
				view.resize();
				selectBase();
				refresh();
				loadModels();
			}
		} catch (error) {
			console.error('No se pudo iniciar la vista 3D:', error);
			if (active && current === generation) {
				status.textContent = 'No se pudo iniciar la vista 3D. Revisá la conexión y WebGL; volvé a 2D para reintentar.';
			}
		}
	}

	function close() {
		active = false;
		infoPanel.hidden = true;
		generation++;
		refreshVersion++;
		if (view) {
			const center = view.getCenter();
			view.stop();
			const zoom = return2DZoom(view.getZoom(), opened3DZoom, initial2DZoom);
			const unchanged = Math.abs(center.lat - CITY_CENTER[1]) < 0.000001 &&
				Math.abs(center.lng - CITY_CENTER[0]) < 0.000001;
			map.setView(unchanged ? initial2DCenter : [center.lat, center.lng], zoom, { animate: false });
		}
		container.hidden = true;
		map.getContainer().removeAttribute('inert');
		button.setAttribute('aria-pressed', 'false');
		map.invalidateSize();
		button.focus();
	}

	baseSelect.addEventListener('change', () => {
		Object.keys(baseMaps).forEach((name) => {
			if (map.hasLayer(baseMaps[name])) map.removeLayer(baseMaps[name]);
		});
		baseMaps[baseSelect.value].addTo(map);
		selectBase();
	});
	closeButton.addEventListener('click', close);
	infoClose.addEventListener('click', () => { infoPanel.hidden = true; });
	button.addEventListener('click', open);
}
