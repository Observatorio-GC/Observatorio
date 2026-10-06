/**
 * MÓDULO DE MEDICIÓN MEJORADO
 * Maneja mediciones lineales y areales con etiquetas persistentes
 */

export function initMeasurement(map, drawnItems) {
	console.log('🎯 Iniciando módulo de medición mejorado');

	// Calcular distancia entre dos puntos (en metros)
	const calculateDistance = (latlng1, latlng2) => {
		return latlng1.distanceTo(latlng2);
	};

	// Calcular distancia total de una línea (en metros)
	const calculatePolylineDistance = (latlngs) => {
		let totalDistance = 0;
		for (let i = 0; i < latlngs.length - 1; i++) {
			totalDistance += calculateDistance(latlngs[i], latlngs[i + 1]);
		}
		return totalDistance;
	};

	// Calcular área de un polígono (en metros cuadrados)
	const calculatePolygonArea = (latlngs) => {
		// Usando fórmula de Shoelace con Haversine para cálculo preciso de área
		const R = 6371000; // Radio de la Tierra en metros
		const points = latlngs[0]; // Obtener anillo exterior
		
		if (points.length < 3) return 0;

		let area = 0;
		for (let i = 0; i < points.length; i++) {
			const p1 = points[i];
			const p2 = points[(i + 1) % points.length];
			
			const lat1 = (p1.lat * Math.PI) / 180;
			const lon1 = (p1.lng * Math.PI) / 180;
			const lat2 = (p2.lat * Math.PI) / 180;
			const lon2 = (p2.lng * Math.PI) / 180;
			
			area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
		}
		area = Math.abs((area * R * R) / 2);
		return area;
	};

	// Format distance for display (with commas instead of dots)
	const formatDistance = (meters) => {
		if (meters < 1000) {
			return `${meters.toFixed(2).replace('.', ',')} m`;
		}
		return `${(meters / 1000).toFixed(2).replace('.', ',')} km`;
	};

	// Format area for display in m² (with commas instead of dots and thousands separator)
	const formatArea = (squareMeters) => {
		const formatted = squareMeters.toFixed(2).replace('.', ',');
		const parts = formatted.split(',');
		const integer = parts[0];
		const decimal = parts[1];
		
		// Add thousands separator (punto)
		const withSeparator = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
		
		return `${withSeparator},${decimal} m²`;
	};

	// Crear etiqueta de medición
	const createMeasurementLabel = (layer, measurement) => {
		if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
			// Es una línea (no es un polígono)
			const latlngs = layer.getLatLngs();
			const distance = calculatePolylineDistance(latlngs);
			
			// Obtener el punto medio de la línea para colocar la etiqueta
			let midIndex = Math.floor(latlngs.length / 2);
			let midPoint = latlngs[midIndex];
			
			const tooltip = L.tooltip({
				permanent: true,
				direction: 'top',
				offset: [0, -10],
				opacity: 0.95,
				className: 'measurement-label distance-label'
			})
			.setContent(`<strong>📏 ${formatDistance(distance)}</strong>`)
			.setLatLng(midPoint);
			
			layer.bindTooltip(tooltip);
			layer.openTooltip();
			
			// Almacenar datos de medición en la capa
			layer.measurementData = {
				type: 'distance',
				value: distance,
				formatted: formatDistance(distance)
			};
			
			console.log(`📏 Distancia: ${formatDistance(distance)}`);
		} else if (layer instanceof L.Polygon) {
			// Es un polígono
			const latlngs = layer.getLatLngs();
			const area = calculatePolygonArea(latlngs);
			
			// Obtener centro del polígono (usando límites)
			const bounds = layer.getBounds();
			const center = bounds.getCenter();
			
			const tooltip = L.tooltip({
				permanent: true,
				direction: 'center',
				offset: [0, 0],
				opacity: 0.95,
				className: 'measurement-label area-label'
			})
			.setContent(`<strong>📐 ${formatArea(area)}</strong>`)
			.setLatLng(center);
			
			layer.bindTooltip(tooltip);
			layer.openTooltip();
			
			// Almacenar datos de medición en la capa
			layer.measurementData = {
				type: 'area',
				value: area,
				formatted: formatArea(area)
			};
			
			console.log(`📐 Área: ${formatArea(area)}`);
		}
	};

	// Manejar elementos dibujados
	map.on('draw:created', function(e) {
		const layer = e.layer;
		drawnItems.addLayer(layer);
		
		// Aplicar estilos
		if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
			// Estilo de línea
			layer.setStyle({
				color: '#2563eb',
				weight: 3,
				opacity: 0.8,
				dashArray: '5, 5',
				lineCap: 'round',
				lineJoin: 'round'
			});
		} else if (layer instanceof L.Polygon) {
			// Estilo de polígono
			layer.setStyle({
				color: '#dc2626',
				weight: 2,
				opacity: 0.8,
				fillColor: '#fca5a5',
				fillOpacity: 0.3,
				dashArray: '5, 5'
			});
		}
		
		// Agregar etiqueta de medición
		createMeasurementLabel(layer);
		
		console.log('✅ Forma dibujada y medida agregada');
	});

	// Manejar elementos editados - recalcular mediciones
	map.on('draw:edited', function(e) {
		const layers = e.layers;
		layers.eachLayer(function(layer) {
			if (layer.measurementData) {
				// Remover etiqueta antigua
				if (layer.getTooltip()) {
					layer.unbindTooltip();
				}
				// Recalcular y agregar nueva etiqueta
				createMeasurementLabel(layer);
				console.log('🔄 Medida recalculada');
			}
		});
	});

	// Manejar elementos eliminados
	map.on('draw:deleted', function(e) {
		const layers = e.layers;
		layers.eachLayer(function(layer) {
			if (layer.measurementData) {
				console.log('🗑️ Medida eliminada');
				layer.measurementData = null;
			}
		});
	});

	return {
		calculateDistance,
		calculatePolylineDistance,
		calculatePolygonArea,
		formatDistance,
		formatArea,
		createMeasurementLabel
	};
}
