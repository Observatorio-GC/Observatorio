import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initAddressSearcher } from '../js/geocoder.js';

test('quitar una dirección no elimina otros marcadores y permite buscar nuevamente', async (t) => {
	class Element extends EventTarget {
		constructor() {
			super();
			this.children = [];
			this.value = '';
			this.style = {};
			this.classList = { add() {}, remove() {}, contains() { return false; } };
		}
		append(...children) { this.children.push(...children); }
		setAttribute() {}
	}

	const ids = [
		'address-search-input', 'address-search-suggestions', 'address-search-container',
		'address-search-toggle', 'address-search-panel'
	];
	const elements = Object.fromEntries(ids.map((id) => [id, new Element()]));
	const originalWindow = globalThis.window;
	const originalDocument = globalThis.document;
	const originalLeaflet = globalThis.L;
	t.after(() => {
		globalThis.window = originalWindow;
		globalThis.document = originalDocument;
		globalThis.L = originalLeaflet;
	});

	const layers = new Set();
	const otherMarker = {};
	layers.add(otherMarker);
	const map = {
		removeLayer(layer) { layers.delete(layer); },
		setView() {}
	};
	const leaflet = {
		icon(options) { return options; },
		marker() {
			return {
				addTo() { layers.add(this); return this; },
				bindPopup(content) { this.popup = content; return this; },
				openPopup() { return this; }
			};
		}
	};
	globalThis.L = leaflet;
	globalThis.window = {
		L: leaflet,
		matchMedia: () => ({ matches: false }),
		addEventListener() {}
	};
	globalThis.document = {
		getElementById: (id) => elements[id],
		createElement: () => new Element(),
		addEventListener() {}
	};
	t.mock.method(globalThis, 'fetch', async () => ({
		json: async () => [{ lat: '-32.925', lon: '-68.844', display_name: 'San Martín' }]
	}));

	initAddressSearcher(map);
	const search = async () => {
		elements['address-search-input'].value = 'San Martín';
		const event = new Event('keydown', { cancelable: true });
		Object.defineProperty(event, 'key', { value: 'Enter' });
		elements['address-search-input'].dispatchEvent(event);
		await new Promise((resolve) => setImmediate(resolve));
		return [...layers].find((layer) => layer !== otherMarker);
	};

	const first = await search();
	assert.equal(layers.size, 2);
	assert.equal(first.popup.children[2].textContent, 'Quitar marcador');
	first.popup.children[2].dispatchEvent(new Event('click'));
	assert.deepEqual([...layers], [otherMarker]);

	const second = await search();
	const replacement = await search();
	assert.notEqual(second, replacement);
	assert.equal(layers.has(second), false);
	assert.equal(layers.size, 2);
	replacement.popup.children[2].dispatchEvent(new Event('click'));
	assert.deepEqual([...layers], [otherMarker]);
});
