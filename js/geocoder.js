/**
 * GEOCODER MODULE - Buscador de Direcciones
 * Usa Nominatim API (OpenStreetMap) directamente con fetch
 * Autocompletado en tiempo real
 */

console.log('%c geocoder.js CARGADO', 'color: #667eea; font-weight: bold; font-size: 14px;');

let geocoderMarker = null;

/**
 * Inicializar el buscador de direcciones
 * @param {L.Map} map - Instancia del mapa Leaflet
 */
export function initAddressSearcher(map) {
	if (!window.L) {
		console.error('Leaflet no esta disponible');
		return;
	}

	const searchInput = document.getElementById('address-search-input');
	const searchSuggestions = document.getElementById('address-search-suggestions');
	const searchContainer = document.getElementById('address-search-container');
	const searchToggle = document.getElementById('address-search-toggle');

	if (!searchInput) {
		console.error('No se encontro #address-search-input');
		return;
	}

	console.log('Inicializando buscador de direcciones con API Nominatim...');

	let autocompleteTimeout;
	const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
	const isMobileSearch = () => window.matchMedia('(max-width: 900px)').matches;
	const closeMobileSearch = () => {
		if (isMobileSearch()) {
			searchContainer.classList.remove('expanded');
		}
		searchSuggestions.classList.remove('active');
	};
	const openMobileSearch = () => {
		searchContainer.classList.add('expanded');
		searchInput.focus();
	};

	if (searchToggle) {
		searchToggle.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();

			if (searchContainer.classList.contains('expanded')) {
				closeMobileSearch();
				return;
			}

			openMobileSearch();
		});
	}

	/**
	 * Buscar sugerencias mientras tipea (debounce 300ms)
	 */
	searchInput.addEventListener('input', (e) => {
		clearTimeout(autocompleteTimeout);
		const query = e.target.value.trim();

		if (query.length < 3) {
			searchSuggestions.innerHTML = '';
			searchSuggestions.classList.remove('active');
			return;
		}

		console.log('Buscando:', query);

		autocompleteTimeout = setTimeout(() => {
			searchNominatim(query, NOMINATIM_URL, searchSuggestions, map, searchInput);
		}, 300);
	});

	/**
	 * Buscar cuando se presiona Enter (busqueda completa)
	 */
	searchInput.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			const query = searchInput.value.trim();
			if (query.length > 0) {
				console.log('Busqueda por Enter:', query);
				clearTimeout(autocompleteTimeout);
				searchNominatim(query, NOMINATIM_URL, searchSuggestions, map, searchInput, true);
			}
		}
	});

	/**
	 * Cerrar sugerencias al hacer clic fuera
	 */
	document.addEventListener('click', (e) => {
		if (!searchContainer.contains(e.target)) {
			closeMobileSearch();
		}
	});

	console.log('Buscador de direcciones inicializado correctamente');
}

/**
 * Buscar en Nominatim usando fetch
 */
function searchNominatim(query, baseUrl, suggestionsDiv, map, input, isFullSearch = false) {
	// Agregar contexto geografico para Godoy Cruz
	const searchQuery = query.includes('Godoy Cruz') 
		? query 
		: query + ', Godoy Cruz, Mendoza, Argentina';

	const params = new URLSearchParams({
		q: searchQuery,
		format: 'json',
		limit: isFullSearch ? 1 : 8,
		addressdetails: 1,
		countrycodes: 'ar'  // Limitar a Argentina
	});

	const url = `${baseUrl}/search?${params}`;
	console.log('Llamando Nominatim:', url);

	fetch(url, {
		headers: { 'Accept-Language': 'es' }
	})
	.then(response => response.json())
	.then(results => {
		console.log('Resultados Nominatim:', results);
		
		if (results && results.length > 0) {
			if (isFullSearch) {
				// Busqueda completa: navegar directamente
				navigateToLocation(results[0], map, input, suggestionsDiv);
			} else {
				// Autocompletado: mostrar sugerencias
				displaySuggestions(results, suggestionsDiv, map, input);
			}
		} else {
			suggestionsDiv.innerHTML = '<div style="padding: 10px; text-align: center; color: #e74c3c;">No se encontro la direccion</div>';
			suggestionsDiv.classList.add('active');
			setTimeout(() => suggestionsDiv.classList.remove('active'), 3000);
		}
	})
	.catch(error => {
		console.error('Error en busqueda Nominatim:', error);
		suggestionsDiv.innerHTML = '<div style="padding: 10px; text-align: center; color: #e74c3c;">Error en busqueda. Intenta de nuevo.</div>';
		suggestionsDiv.classList.add('active');
	});
}

/**
 * Mostrar sugerencias en dropdown
 */
function displaySuggestions(results, container, map, input) {
	container.innerHTML = '';

	results.forEach((result) => {
		const suggestionDiv = document.createElement('div');
		suggestionDiv.className = 'address-suggestion-item';
		suggestionDiv.textContent = result.display_name || result.address;

		suggestionDiv.addEventListener('click', () => {
			console.log('Resultado seleccionado:', result);
			navigateToLocation(result, map, input, container);
		});

		container.appendChild(suggestionDiv);
	});

	container.classList.add('active');
}

/**
 * Navegar a la ubicacion encontrada
 */
function navigateToLocation(result, map, input, suggestionsDiv) {
	if (!result.lat || !result.lon) {
		console.error('No se pudo obtener coordenadas:', result);
		alert('No se pudo obtener las coordenadas de la ubicacion.');
		return;
	}

	const lat = parseFloat(result.lat);
	const lng = parseFloat(result.lon);
	const name = result.display_name || result.address || 'Ubicacion encontrada';

	console.log('Navegando a:', lat, lng, name);

	if (geocoderMarker) {
		map.removeLayer(geocoderMarker);
	}

	// Crear marcador azul
	geocoderMarker = L.marker([lat, lng], {
		icon: L.icon({
			iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
			shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		})
	}).addTo(map);

	// Popup con informacion
	const popupContent = `
		<div style="font-size: 12px; max-width: 200px;">
			<b>${name}</b><br>
			<small style="color: #999;">Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}</small>
		</div>
	`;

	geocoderMarker.bindPopup(popupContent).openPopup();

	// Centrar y zoom
	map.setView([lat, lng], 17);

	// Limpiar input y sugerencias
	input.value = '';
	suggestionsDiv.classList.remove('active');
	suggestionsDiv.innerHTML = '';
	const searchContainer = document.getElementById('address-search-container');
	if (searchContainer) {
		searchContainer.classList.remove('expanded');
	}

	console.log('Ubicacion navegada exitosamente');
}
