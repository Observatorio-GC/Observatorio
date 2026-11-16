import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildTiles } from '../js/ciudad-3d-data.js';

const sourcePath = resolve('scripts', 'ciudad3D.js');
const outputPath = resolve('data', 'ciudad-3d');
const source = await readFile(sourcePath, 'utf8');
const json = source.slice(source.indexOf('{')).replace(/;\s*$/, '');
const collection = JSON.parse(json);
if (collection.type !== 'FeatureCollection' || !Array.isArray(collection.features)) {
	throw new Error('El archivo ciudad3D.js no contiene una colección GeoJSON válida.');
}

const tiles = buildTiles(collection);
await mkdir(outputPath, { recursive: true });
for (const [key, features] of tiles) {
	await writeFile(resolve(outputPath, `${key}.json`), JSON.stringify({ type: 'FeatureCollection', features }));
}
await writeFile(resolve(outputPath, 'manifest.json'), JSON.stringify({ tiles: Array.from(tiles.keys()).sort() }));
console.log(`Generadas ${tiles.size} zonas para ${collection.features.length} edificaciones en ${outputPath}`);
