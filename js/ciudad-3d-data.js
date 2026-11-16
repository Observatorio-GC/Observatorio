export const CELL_SIZE = 0.01;

export function tileKeysForBounds(bounds) {
	const keys = [];
	for (let x = Math.floor(bounds[0] / CELL_SIZE); x <= Math.floor(bounds[2] / CELL_SIZE); x++) {
		for (let y = Math.floor(bounds[1] / CELL_SIZE); y <= Math.floor(bounds[3] / CELL_SIZE); y++) {
			keys.push(`${x}_${y}`);
		}
	}
	return keys;
}

export function buildTiles(collection) {
	const tiles = new Map();
	collection.features.forEach((source, id) => {
		const geometry = source.geometry;
		if (!geometry || !['Polygon', 'MultiPolygon'].includes(geometry.type)) return;
		const bounds = [Infinity, Infinity, -Infinity, -Infinity];
		const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
		polygons.forEach((polygon) => polygon.forEach((ring) => ring.forEach(([lng, lat]) => {
			bounds[0] = Math.min(bounds[0], lng);
			bounds[1] = Math.min(bounds[1], lat);
			bounds[2] = Math.max(bounds[2], lng);
			bounds[3] = Math.max(bounds[3], lat);
		})));
		if (!bounds.every(Number.isFinite)) return;
		const value = source.properties && source.properties.altura_m;
		const height = typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
		const feature = { type: 'Feature', id, bbox: bounds, properties: { height }, geometry };
		tileKeysForBounds(bounds).forEach((key) => {
			if (!tiles.has(key)) tiles.set(key, []);
			tiles.get(key).push(feature);
		});
	});
	return tiles;
}

export function mergeTiles(tiles, bounds) {
	const features = new Map();
	tiles.forEach((tile) => tile.features.forEach((feature) => {
		const b = feature.bbox;
		if (!bounds || (b[0] <= bounds[2] && b[2] >= bounds[0] && b[1] <= bounds[3] && b[3] >= bounds[1])) {
			features.set(feature.id, feature);
		}
	}));
	return Array.from(features.values());
}
