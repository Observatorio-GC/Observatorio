import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initial3DZoom, return2DZoom } from '../js/ciudad-3d.js';
import { buildTiles, mergeTiles, tileKeysForBounds } from '../js/ciudad-3d-data.js';

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
