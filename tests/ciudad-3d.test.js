import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { initCity3D, initial3DZoom, return2DZoom } from '../js/ciudad-3d.js';
import { buildTiles, mergeTiles, tileKeysForBounds } from '../js/ciudad-3d-data.js';
import { CHURCH_ORIGIN, MODELS_3D, containsPoint, coveredByLoadedModel, createChurchModelLayer, disposeModel, modelIntersectsBounds, withoutCoveredPolygons } from '../js/iglesia-3d.js';

const square = (west, south, east, north, height) => ({
	type: 'Feature',
	properties: { altura_m: height },
	geometry: { type: 'Polygon', coordinates: [[
		[west, south], [east, south], [east, north], [west, north], [west, south]
	]] }
});

test('los edificios que cruzan zonas conservan su altura y no se duplican al unirlas', () => {
	const tiles = buildTiles({ features: [
		square(-69.02, -33.02, -68.99, -32.99, 12),
		square(-68.8, -32.8, -68.79, -32.79, 3)
	] });
	const keys = tileKeysForBounds([-69.03, -33.03, -68.98, -32.98]);
	const result = mergeTiles(keys.filter((key) => tiles.has(key)).map((key) => ({ features: tiles.get(key) })));
	assert.equal(result.length, 1);
	assert.equal(result[0].properties.height, 12);
});

test('las alturas ausentes o inválidas quedan planas', () => {
	const tiles = buildTiles({ features: [
		square(-69, -33, -68.999, -32.999, null),
		square(-69, -33, -68.999, -32.999, -3),
		square(-69, -33, -68.999, -32.999, '12'),
		{ geometry: null, properties: {} }
	] });
	assert.deepEqual(mergeTiles(Array.from(tiles.values(), (features) => ({ features })))
		.map((f) => f.properties.height), [0, 0, 0]);
});

test('solo se dibujan las geometrías que intersectan el área visible', () => {
	const tiles = buildTiles({ features: [
		square(-69, -33, -68.999, -32.999, 3),
		square(-68.998, -33, -68.997, -32.999, 6)
	] });
	const features = mergeTiles(Array.from(tiles.values(), (items) => ({ features: items })),
		[-69.001, -33.001, -68.9985, -32.998]);
	assert.deepEqual(features.map((feature) => feature.properties.height), [3]);
});

test('la vista 3D se acerca para mostrar edificios y respeta un zoom ya cercano', () => {
	assert.equal(initial3DZoom(13), 16);
	assert.equal(initial3DZoom(18), 17);
});

test('al volver a 2D conserva el zoom anterior si no se cambió la escala 3D', () => {
	assert.equal(return2DZoom(16, 16, 13), 13);
	assert.equal(return2DZoom(17, 16, 13), 18);
});

test('identifica el edificio que contiene el modelo sin excluir polígonos vecinos o huecos', () => {
	const [x, y] = CHURCH_ORIGIN;
	const ring = (radius) => [
		[x - radius, y - radius], [x + radius, y - radius],
		[x + radius, y + radius], [x - radius, y + radius], [x - radius, y - radius]
	];
	assert.equal(containsPoint({ type: 'Polygon', coordinates: [ring(0.001)] }, CHURCH_ORIGIN), true);
	assert.equal(containsPoint({ type: 'Polygon', coordinates: [ring(0.001), ring(0.0001)] }, CHURCH_ORIGIN), false);
	assert.equal(containsPoint({ type: 'MultiPolygon', coordinates: [[ring(0.001)]] }, CHURCH_ORIGIN), true);
	assert.equal(containsPoint({ type: 'Polygon', coordinates: [ring(0.001)] }, [x + 0.002, y]), false);
});

test('el punto de la iglesia coincide con un único edificio del parcelario publicado', async () => {
	const key = tileKeysForBounds([...CHURCH_ORIGIN, ...CHURCH_ORIGIN])[0];
	const tile = JSON.parse(await readFile(new URL(`../data/ciudad-3d/${key}.json`, import.meta.url), 'utf8'));
	const matching = tile.features.filter((feature) => containsPoint(feature.geometry, CHURCH_ORIGIN));
	assert.equal(matching.length, 1);
});

test('cada modelo oculta solamente su edificio cuando se carga correctamente', async () => {
	for (const model of MODELS_3D) {
		for (const point of model.footprints || [model.footprint || model.origin]) {
			const key = tileKeysForBounds([...point, ...point])[0];
			const tile = JSON.parse(await readFile(new URL(`../data/ciudad-3d/${key}.json`, import.meta.url), 'utf8'));
			const matches = tile.features.filter((feature) => containsPoint(feature.geometry, point));
			assert.equal(matches.length, 1, model.name);
			assert.equal(coveredByLoadedModel(matches[0].geometry, new Map()), false, model.name);
			assert.equal(coveredByLoadedModel(matches[0].geometry, new Map([[model.id, {}]])), true, model.name);
		}
	}
});

test('oculta las partes superpuestas sin modificar las geometrías originales ni las vecinas', () => {
	const [x, y] = MODELS_3D.find((model) => model.id === 'iglesia').footprints[0];
	const covered = square(x - 0.00001, y - 0.00001, x + 0.00001, y + 0.00001, 3).geometry.coordinates;
	const neighbor = square(x + 0.001, y + 0.001, x + 0.002, y + 0.002, 3).geometry.coordinates;
	const feature = {
		type: 'Feature', properties: { height: 3 },
		bbox: [x - 0.00001, y - 0.00001, x + 0.002, y + 0.002],
		geometry: { type: 'MultiPolygon', coordinates: [covered, neighbor] }
	};
	const loaded = new Map([['iglesia', {}]]);
	assert.equal(withoutCoveredPolygons(feature, new Map()), feature);
	const filtered = withoutCoveredPolygons(feature, loaded);
	assert.deepEqual(filtered.geometry.coordinates, [neighbor]);
	assert.equal(feature.geometry.coordinates.length, 2);
	assert.equal(withoutCoveredPolygons({ ...feature, geometry: { type: 'Polygon', coordinates: covered } }, loaded), null);
});

test('carga modelos por zona considerando sus huellas, incluso cuando el origen queda fuera', () => {
	const arizu = MODELS_3D.find((model) => model.id === 'arizu');
	assert.equal(modelIntersectsBounds(arizu, [-68.844, -32.9102, -68.8439, -32.9101]), true);
	assert.equal(modelIntersectsBounds(arizu, [-68.845, -32.927, -68.843, -32.925]), false);
	const model = { origin: [0, 0], footprints: [[2, 2]] };
	assert.equal(modelIntersectsBounds(model, [0.9, 0.9, 1.1, 1.1]), true);
});

test('libera geometrías, materiales y texturas compartidas una sola vez', () => {
	const calls = [];
	const texture = { isTexture: true, dispose: () => calls.push('texture') };
	const material = { map: texture, normalMap: texture, dispose: () => calls.push('material') };
	const geometry = { dispose: () => calls.push('geometry') };
	disposeModel({ traverse(callback) {
		callback({ geometry, material });
		callback({ geometry, material: [material, material] });
	} });
	assert.deepEqual(calls, ['material', 'texture', 'geometry']);
});

test('cerrar y reabrir descarta y libera los modelos que terminan de cargar tarde', async (t) => {
	const previous = {
		window: globalThis.window, document: globalThis.document, fetch: globalThis.fetch,
		THREE: globalThis.THREE, maplibregl: globalThis.maplibregl
	};
	t.after(() => {
		Object.entries(previous).forEach(([key, value]) => {
			if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
		});
	});
	const elements = new Map();
	function element(id) {
		if (!elements.has(id)) elements.set(id, {
			hidden: true, value: '', listeners: {},
			addEventListener(name, callback) { this.listeners[name] = callback; },
			setAttribute() {}, removeAttribute() {}, focus() {}
		});
		return elements.get(id);
	}
	globalThis.document = { getElementById: element };
	globalThis.fetch = async () => ({ ok: true, json: async () => ({ tiles: [] }) });
	const requests = [];
	const three = { GLTFLoader: class {
		load(url, success, progress, failure) { requests.push({ url, success, failure }); }
	} };
	globalThis.window = { THREE: three, maplibregl: {} };
	globalThis.THREE = three;
	const views = [];
	let center = CHURCH_ORIGIN;
	class FakeView {
		constructor() { this.handlers = {}; this.layers = new Map(); views.push(this); }
		addControl() {}
		on(name, handler) { this.handlers[name] = handler; }
		getBounds() { return {
			getWest: () => center[0], getEast: () => center[0],
			getSouth: () => center[1], getNorth: () => center[1]
		}; }
		getCenter() { return { lng: -68.844306, lat: -32.925132 }; }
		getZoom() { return 16; }
		getSource() { return { setData() {} }; }
		setLayoutProperty() {}
		addLayer(layer) { this.layers.set(layer.id, layer); }
		removeLayer(id) {
			const layer = this.layers.get(id);
			if (id.startsWith('model-')) layer.onRemove();
			this.layers.delete(id);
		}
		stop() {}
		remove() { this.removed = true; }
	}
	globalThis.maplibregl = {
		Map: FakeView, NavigationControl: class {}, AttributionControl: class {},
		MercatorCoordinate: { fromLngLat: () => ({ x: 0, y: 0, z: 0,
			meterInMercatorCoordinateUnits: () => 1 }) }
	};
	const map = {
		getZoom: () => 13, getCenter: () => ({ lat: 0, lng: 0 }),
		getContainer: () => element('map'), setView() {}, invalidateSize() {}
	};
	initCity3D(map, {});
	const open = element('btn-ciudad-3d').listeners.click;
	const close = element('ciudad-3d-close').listeners.click;
	await open();
	assert.equal(element('ciudad-3d-base').value, 'OpenStreetMap');
	views[0].handlers.load();
	await new Promise(setImmediate);
	const oldChurch = requests.find((request) => request.url.endsWith('/iglesia.glb'));
	assert.ok(oldChurch);
	assert.equal(requests.some((request) => request.url.endsWith('/arizu.glb')), false);
	views[0].handlers.moveend();
	assert.equal(requests.filter((request) => request.url.endsWith('/iglesia.glb')).length, 1);
	center = MODELS_3D.find((model) => model.id === 'arizu').origin;
	views[0].handlers.moveend();
	await new Promise(setImmediate);
	assert.equal(requests.some((request) => request.url.endsWith('/arizu.glb')), true);
	center = CHURCH_ORIGIN;
	close();
	assert.equal(views[0].removed, true);
	await open();
	views[1].handlers.load();
	await new Promise(setImmediate);
	const newChurch = requests.filter((request) => request.url.endsWith('/iglesia.glb'))[1];
	assert.ok(newChurch);
	let oldDisposed = 0;
	oldChurch.success({ scene: { traverse(callback) {
		callback({ geometry: { dispose() { oldDisposed++; } } });
	} } });
	await new Promise(setImmediate);
	assert.equal(oldDisposed, 1);
	assert.equal(views[1].layers.has('model-iglesia'), false);
	let newDisposed = 0;
	newChurch.success({ scene: { traverse(callback) {
		callback({ geometry: { dispose() { newDisposed++; } } });
	} } });
	await new Promise(setImmediate);
	assert.equal(views[1].layers.has('model-iglesia'), true);
	close();
	assert.equal(newDisposed, 1);
});

test('la capa de la iglesia dibuja el modelo en el contexto compartido del mapa', () => {
	const oldThree = globalThis.THREE;
	const oldMaplibre = globalThis.maplibregl;
	const calls = [];
	let intersections = [];
	class Matrix {
		makeTranslation() { return this; }
		scale() { return this; }
		makeRotationX() { return this; }
		makeRotationFromEuler() { return this; }
		multiply() { return this; }
		fromArray() { return this; }
		getInverse() { return this; }
	}
	globalThis.maplibregl = { MercatorCoordinate: { fromLngLat: () => ({
		x: 0, y: 0, z: 0, meterInMercatorCoordinateUnits: () => 1
	}) } };
	globalThis.THREE = {
		Camera: class {},
		Scene: class { add() {} },
		AmbientLight: class {},
		DirectionalLight: class { constructor() { this.position = { set() {} }; } },
		Matrix4: Matrix,
		Euler: class {},
		Vector3: class {
			applyMatrix4() { return this; }
			sub() { return this; }
			normalize() { return this; }
		},
		Raycaster: class { intersectObject() { return intersections; } },
		WebGLRenderer: class {
			constructor() { this.state = { reset() { calls.push('reset'); } }; }
			render() { calls.push('render'); }
			dispose() { calls.push('dispose'); }
		}
	};
	try {
		const layer = createChurchModelLayer({ updateMatrixWorld() {}, traverse() {} });
		layer.onAdd({ getCanvas: () => ({ clientWidth: 800, clientHeight: 600 }) }, {});
		assert.equal(layer.pick({ x: 400, y: 300 }), false);
		layer.render({}, []);
		assert.equal(layer.pick({ x: 400, y: 300 }), false);
		intersections = [{}];
		assert.equal(layer.pick({ x: 400, y: 300 }), true);
		layer.onRemove();
		assert.deepEqual(calls, ['reset', 'render', 'dispose']);
	} finally {
		if (oldThree === undefined) delete globalThis.THREE; else globalThis.THREE = oldThree;
		if (oldMaplibre === undefined) delete globalThis.maplibregl; else globalThis.maplibregl = oldMaplibre;
	}
});
