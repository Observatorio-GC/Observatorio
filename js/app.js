/**
 * APPLICATION MAIN SCRIPT - MEJORADO CON CATEGORÍAS
 * Inicializa el mapa con panel avanzado y capas organizadas por categoría
 */

console.log('%c app.js CARGADO', 'color: green; font-weight: bold; font-size: 14px;');

// Verificar que Leaflet está disponible
if (typeof L === 'undefined') {
	console.error('? CRÍTICO: Leaflet no está cargado');
} else {
	console.log('? Leaflet disponible');
}

// Verificar que el mapa existe
if (!document.getElementById('map')) {
	console.error('? CRÍTICO: Elemento #map no encontrado en el HTML');
} else {
	console.log('? Elemento #map encontrado');
}

// ALIAS PARA CORREGIR NOMBRES DE VARIABLES CON MAYÚSCULA/MINÚSCULA
if (typeof centrosdesalud !== 'undefined') {
	window.Centrosdesalud = centrosdesalud;
	console.log('? Alias creado: centrosdesalud ? Centrosdesalud');
}

// FUNCIÓN PARA CALCULAR CENTROIDE DE POLÍGONO
const calculateCentroid = (coords) => {
	let latSum = 0, lonSum = 0;
	for (let i = 0; i < coords.length; i++) {
		lonSum += coords[i][0];
		latSum += coords[i][1];
	}
	return L.latLng(latSum / coords.length, lonSum / coords.length);
};

// ---------------------------------------------------------------
// FUNCIONES DE DESCARGA Y CONVERSIÓN DE FORMATOS
// ---------------------------------------------------------------

// Convertir GeoJSON a KML
const geojsonToKml = (geojson, name = 'layer') => {
	let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
<name>${name}</name>
<Style id="defaultStyle">
<LineStyle><color>ff0000ff</color><width>2</width></LineStyle>
<PolyStyle><fill>1</fill><outline>1</outline><color>7f0000ff</color></PolyStyle>
</Style>`;

	if (geojson.features) {
		geojson.features.forEach(feature => {
			const props = feature.properties || {};
			const name = props.Nombre || props.Nombre_1 || props.name || props.NAME || 'Feature';
			const desc = Object.entries(props).map(([k, v]) => `${k}: ${v}`).join('<br/>');
			
			kml += `<Placemark>
<name>${name}</name>
<description>${desc}</description>`;

			if (feature.geometry) {
				const geom = feature.geometry;
				if (geom.type === 'Point') {
					kml += `<Point><coordinates>${geom.coordinates[0]},${geom.coordinates[1]},0</coordinates></Point>`;
				} else if (geom.type === 'LineString') {
					kml += `<LineString><coordinates>`;
					geom.coordinates.forEach(coord => kml += `${coord[0]},${coord[1]},0 `);
					kml += `</coordinates></LineString>`;
				} else if (geom.type === 'Polygon') {
					kml += `<Polygon><outerBoundaryIs><LinearRing><coordinates>`;
					geom.coordinates[0].forEach(coord => kml += `${coord[0]},${coord[1]},0 `);
					kml += `</coordinates></LinearRing></outerBoundaryIs></Polygon>`;
				}
			}
			kml += `</Placemark>`;
		});
	}

	kml += `</Document></kml>`;
	return kml;
};

// Descargar archivo
const downloadFile = (content, filename, mimeType) => {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};

// Mostrar menú de descarga
const showDownloadMenu = (varName, displayName) => {
	if (!window.downloadMenuOpen) {
		// Crear menú contextual
		const menu = document.createElement('div');
		menu.style.cssText = `
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background: white;
			border: 2px solid #667eea;
			border-radius: 8px;
			padding: 20px;
			box-shadow: 0 4px 20px rgba(0,0,0,0.3);
			z-index: 10000;
			min-width: 300px;
		`;

		menu.innerHTML = `
			<div style="text-align: center; margin-bottom: 20px;">
				<h3 style="margin: 0 0 10px 0; color: #333;">Descargar: ${displayName}</h3>
				<p style="color: #666; font-size: 12px; margin: 0;">Selecciona un formato</p>
			</div>
			<div style="display: flex; flex-direction: column; gap: 10px;">
				<button id="download-geojson" style="padding: 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">📥 GeoJSON</button>
				<button id="download-kml" style="padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">📥 KML</button>
				<button id="download-kmz" style="padding: 12px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">📥 KMZ (comprimido)</button>
			</div>
			<button id="close-download-menu" style="width: 100%; margin-top: 15px; padding: 8px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">Cerrar</button>
		`;

		document.body.appendChild(menu);
		window.downloadMenuOpen = true;

		// Obtener GeoJSON de la capa
		const geoJsonData = window[varName];
		if (!geoJsonData) {
			console.error(`? No se encontró GeoJSON para: ${varName}`);
			return;
		}

		// Manejadores de descarga
		document.getElementById('download-geojson').onclick = () => {
			downloadFile(
				JSON.stringify(geoJsonData, null, 2),
				`${displayName}.geojson`,
				'application/json'
			);
			console.log(`? Descargado: ${displayName}.geojson`);
			menu.remove();
			window.downloadMenuOpen = false;
		};

		document.getElementById('download-kml').onclick = () => {
			const kml = geojsonToKml(geoJsonData, displayName);
			downloadFile(kml, `${displayName}.kml`, 'application/vnd.google-earth.kml+xml');
			console.log(`? Descargado: ${displayName}.kml`);
			menu.remove();
			window.downloadMenuOpen = false;
		};

		document.getElementById('download-kmz').onclick = async () => {
			try {
				const { default: JSZip } = await import('jszip');
				const kml = geojsonToKml(geoJsonData, displayName);
				const zip = new JSZip();
				zip.file('doc.kml', kml);
				const blob = await zip.generateAsync({ type: 'blob' });
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = `${displayName}.kmz`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
				console.log(`? Descargado: ${displayName}.kmz`);
				menu.remove();
				window.downloadMenuOpen = false;
			} catch (err) {
				console.error('? Error comprimiendo KMZ:', err);
				alert('Error al comprimir KMZ. Descarga KML en su lugar.');
			}
		};

		document.getElementById('close-download-menu').onclick = () => {
			menu.remove();
			window.downloadMenuOpen = false;
		};

		// Cerrar al hacer clic fuera
		document.addEventListener('click', (e) => {
			if (!menu.contains(e.target) && window.downloadMenuOpen) {
				menu.remove();
				window.downloadMenuOpen = false;
			}
		}, { once: true });
	}
};

window.addEventListener('unhandledrejection', (e) => {
	console.error('? Promise rechazada no manejada:', e.reason);
});

// ---------------------------------------------------------------
// CONFIGURACIÓN DE POPUPS POR CAPA
// Filtra propiedades para no mostrar IDs irrelevantes
// ---------------------------------------------------------------
const popupConfig = {
	// Capas que NO deben mostrar popup
	noPopup: ['Traza'],
	
	// Configuración de imágenes por capa: { imagePath: 'ruta/carpeta', propertyName: 'campo_que_contiene_archivo' }
	imageConfig: {
		'Barrios': { imagePath: 'img/Muvi/', propertyName: 'Fotos' },
		'BarriosConsolidados': { imagePath: 'img/Muvi/', propertyName: 'Fotos' },
		'BarriosPopulares': { imagePath: 'img/Muvi/', propertyName: 'Fotos' },
		'Edificios': { imagePath: 'img/Muvi/', propertyName: 'Fotos' },
		'Esculturas': { imagePath: 'img/esculturas/', propertyName: 'Fotos' },
		'SitiosyConjuntosEdilicios': { imagePath: 'img/Muvi/', propertyName: 'Fotos' },
		'Bodegas': { imagePath: 'img/Muvi/', propertyName: 'Fotos' },
		'CentrosJubilados': { imagePath: 'img/Muvi/', propertyName: 'Fotos' },
		'TramosyCarriles': { imagePath: 'img/Muvi/', propertyName: 'Fotos' }
	},
	
	// Capas con enlaces especiales
	linkConfig: {
		'ZonaA': { propertyName: 'ENLACE', titleProperty: 'Nombre_1' },
		'ZonaB': { propertyName: 'Enlace', titleProperty: 'Nombre' }
	},
	
	// Campos a EXCLUIR (no mostrar)
	excludeFields: ['id', 'ID', 'fid', 'FID', 'gid', 'GID', 'ObjectID', 'OBJECTID', 'qc_id', 'QC_ID', '_', 'geom', 'geometry', 'ENLACE', 'Enlace', 'Link', 'LINK', 'Nombre_1', 'Nombre', 'Latitud', 'Longitud']
};

// Función para generar popup limpio (sin IDs internos)
const generatePopupContent = (feature, layerName) => {
	if (!feature.properties) return '';
	
	const excludeFields = popupConfig.excludeFields;
	let popupHtml = '';
	let hasContent = false;
	
	// MANEJO ESPECIAL PARA ZONA A Y ZONA B - Implementa la lógica del código original
	const linkCfg = popupConfig.linkConfig[layerName];
	if (linkCfg && feature.properties[linkCfg.propertyName]) {
		const enlace = feature.properties[linkCfg.propertyName];
		const nombre = feature.properties[linkCfg.titleProperty] || 'Información';
		
		// Construir el HTML exactamente como en el código original
		if (enlace) {
			const googleDriveLink = "https://drive.google.com/file/d/1AOpgP6pQGdng5A6eSS5_JihShP-CSp-l/view?usp=sharing";
			const zonaTexto = layerName === 'ZonaA' 
				? "Zona por sobre Límite Óptimo Concertado." 
				: "Zona por debajo del Límite Óptimo Concertado.";
			
			popupHtml += "<strong>" + zonaTexto + "</strong> <strong>Ubicación subzonas: </strong>" + 
				"<a href='" + googleDriveLink + "' target='_blank'>Ver</a>" + "<br />";
			popupHtml += "<iframe src='" + enlace + "' style='width: 301px; height: 515px; border: 2px solid #888888; margin-top:10px' scrolling='no'></iframe>";
			popupHtml += "<br /><a href='" + enlace + "' target='_blank'>Abrir en otra pestaña</a>";
		} else {
			popupHtml += "<strong>" + nombre + "</strong>";
		}
		return popupHtml;
	}
	
	// POPUP ESTÁNDAR para otras capas
	popupHtml = '<div style="font-size:12px;max-width:350px;">';
	
	// BUSCAR Y MOSTRAR NOMBRE PRIMERO (como título destacado)
	const nameFields = ['Nombre', 'nombre', 'Name', 'name', 'NOMBRE', 'Nombre_1', 'titulo', 'Título', 'TITULO', 'title', 'Title'];
	let nombreEncontrado = false;
	
	for (let fieldName of nameFields) {
		if (feature.properties[fieldName] && !nombreEncontrado) {
			const nombreValue = feature.properties[fieldName];
			popupHtml += `<div style="background-color:#e6ccff;padding:8px;border-radius:4px;margin-bottom:10px;border-left:4px solid #6B1FA6;">`;
			popupHtml += `<h3 style="margin:0;color:#6B1FA6;font-size:14px;font-weight:bold;">${nombreValue}</h3>`;
			popupHtml += `</div>`;
			nombreEncontrado = true;
			hasContent = true;
			break;
		}
	}
	
	// Agregar imagen si la capa está configurada para mostrar imágenes
	const imgConfig = popupConfig.imageConfig[layerName];
	if (imgConfig && feature.properties[imgConfig.propertyName]) {
		const imageName = feature.properties[imgConfig.propertyName];
		popupHtml += `<img src="${imgConfig.imagePath}${imageName}" style="width:100%;max-height:160px;border-radius:4px;margin-bottom:8px;" onerror="this.style.display='none';" alt="Imagen">`;
		hasContent = true;
	}
	
	// Agregar propiedades (TODAS excepto las excluidas y el nombre ya mostrado)
	for (let k in feature.properties) {
		// Saltar campos excluidos
		if (excludeFields.includes(k) || k.startsWith('_')) continue;
		
		// Saltar campos de nombre ya mostrados
		if (nameFields.includes(k)) continue;
		
		// Saltar el campo de fotos si ya se mostró como imagen
		if (imgConfig && k === imgConfig.propertyName) continue;
		
		const value = feature.properties[k];
		if (value !== null && value !== undefined && value !== '' && value !== 'null') {
			popupHtml += `<b>${k}:</b> ${value}<br>`;
			hasContent = true;
		}
	}
	
	popupHtml += '</div>';
	return hasContent ? popupHtml : '<div style="font-size:12px;">Sin información disponible</div>';
};

document.addEventListener('DOMContentLoaded', function() {
	console.log('Inicializando Observatorio Territorial Godoy Cruz...');

	// MAPAS BASE
	const baseMaps = {
		"OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; OpenStreetMap',
			maxZoom: 19
		}),
		"Google Satelital": L.tileLayer('http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}', {
			attribution: 'Google',
			maxZoom: 20
		}),
		"ESRI Satelital": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Esri',
			maxZoom: 20
		})
	};

	// CREAR MAPA
	const map = L.map('map', {
		layers: [baseMaps["Google Satelital"]]
	}).setView([-32.9337, -68.8978], 13);

	// LIMPIAR MEMORY PERIODICAMENTE Y MONITOREO
	let layerCountWarning = false;
	let memoryMonitorInterval = setInterval(() => {
		try {
			const layerCount = Object.keys(layers).length;
			
			// Si hay muchas capas, limpiar agresivamente
			if (layerCount > 8) {
				console.warn(` ALERTA: ${layerCount} capas cargadas. Auto-limpiando...`);
				while (Object.keys(layers).length > 6) {
					const oldestLayer = layerStack.shift();
					if (oldestLayer && layers[oldestLayer]) {
						try {
							const oldLayer = layers[oldestLayer];
							if (map.hasLayer(oldLayer.layer)) {
								map.removeLayer(oldLayer.layer);
							}
							if (oldLayer.layer._layers) oldLayer.layer._layers = {};
							delete layers[oldestLayer];
							delete layerStyles[oldestLayer];
							console.warn(`🗑️ "${oldestLayer}" limpiada por monitoreo`);
						} catch (e) {
							console.error('Error limpiando capa:', e);
						}
					}
				}
			}
			
			// Ejecutar garbage collection
			try {
				if (typeof gc !== 'undefined') gc();
				console.log(` GC ejecutado. Capas activas: ${Object.keys(layers).length}`);
			} catch (e) {
				// GC no disponible
			}
		} catch (e) {
			console.error('Error en monitoreo de memoria:', e);
		}
	}, 60000); // Cada 60 segundos más espaciado
	
	// Detener monitoreo cuando la página se cierre
	window.addEventListener('beforeunload', () => {
		clearInterval(memoryMonitorInterval);
		// Limpiar todas las capas
		Object.keys(layers).forEach(key => {
			try {
				if (map.hasLayer(layers[key].layer)) {
					map.removeLayer(layers[key].layer);
				}
				if (layers[key].layer._layers) {
					layers[key].layer._layers = {};
				}
			} catch (e) {}
		});
		layers = {};
		layerStyles = {};
		layerStack = [];
	});

	// CARGAR GODOY CRUZ SIEMPRE ACTIVO
	if (window.godoycruz && window.godoycruz.type === 'FeatureCollection') {
		const godoycruzLayer = L.geoJson(window.godoycruz, {
			style: {
				color: '#0066CC',
				weight: 3,
				opacity: 1,
				fillOpacity: 0,
				dashArray: '5, 5'
			}
		}).addTo(map);
		console.log('? Límite de Godoy Cruz cargado');
	}

	// HERRAMIENTA DE MEDIDA
	if (window.L && window.L.Draw) {
		try {
			const drawnItems = new L.FeatureGroup();
			map.addLayer(drawnItems);

			const drawControl = new L.Control.Draw({
				position: 'topleft',
				draw: {
					polygon: true,
					polyline: true,
					rectangle: true,
					circle: true,
					marker: false
				},
				edit: {
					featureGroup: drawnItems,
					remove: true
				}
			});
			map.addControl(drawControl);

			map.on('draw:created', function(e) {
				const layer = e.layer;
				drawnItems.addLayer(layer);
			});

			console.log('? Herramienta de medida (Draw) agregada');
		} catch (e) {
			console.warn(' Error al cargar herramienta Draw:', e);
		}
	} else {
		console.warn(' L.Draw no disponible');
	}

	// CAPAS
	const layers = {};
	const layerStyles = {};
	const layerStack = [];  // Stack para rastrear orden de capas (FIFO)
	const MAX_ACTIVE_LAYERS = 10;  // Reducido a 10 para máxima estabilidad

	// MAPEO DE CAPAS CON NOMBRES AMIGABLES Y CATEGORÍAS
	const layerConfig = {
		"Movilidad": {
			"Ciclovías Existentes": "CicloviasExistentes",
			"Ciclovías Proyectadas": "CicloviasProyectadasDami",
			"Índice Final de Caminabilidad": "Traza",
			"Estaciones BiciTran": "Bicitran",
			"Metrotranvía": "Metrotranvia",
			"Paradas Metrotranvía": "ParadasMetro",
			"Traza Futura Metrotranvía": "MetroFuturo",
			"Paradas Futuras Metrotranvía": "Paradas",
			"Semáforos": "Semaforos",
			"Semáforos según Demanda": "SemaforosDemanda"
		},
		"Infraestructura Ambiental": {
			"Espacios Verdes": "EspaciosVerdes",
			"Estaciones Meteorológicas": "Estaciones",
			"Granja Solar": "GranjaSolar",
			"Inventario de Gases": "InfoAmbiente",
			"Paneles Solares": "PanelesSolares",
			"Planta de Clasificación de Residuos": "PlantaRecicladora",
			"Puntos de Recepción de Pilas": "PuntosRecepcionPilas",
			"Puntos Verdes": "PuntosVerdes",
			"Solmáforos": "Solmaforos"
		},
		"Sistema Jurídico-Administrativo": {
			"Distritos Departamentales": "DistritosDepartamentales",
			"Límite Urbano": "LimiteUrbano",
			"Línea Municipal y de Edificación": "LineaMunicipal",
			"Zonificación": "Zonificacion",
			"Área de Planificación Integrada y Sostenible del Piedemonte": "APIyS",
			"Zona A (Ley 9.414)": "ZonaA",
			"Zona B (Ley 9.414)": "ZonaB",
			"Límite Óptimo Concertado (Ley 9.414)": "LOC"
		},
		"Infraestructura Urbana y de Servicio": {
			"Bancos": "Bancos",
			"Barrios Consolidados": "BarriosConsolidados",
			"Barrios Populares": "BarriosPopulares",
			"Cajeros": "Cajeros",
			"Ductos de Distribución de Gas": "DuctosGas",
			"Estaciones de Servicio": "EstacionesdeServicio",
			"Líneas de Distribución de Energía": "LineasD",
			"Líneas de Transporte de Energía": "LineasT",
			"Pago Facil - Rapipago": "Pagofacil",
			"Red Colectora Cloacal (AYSAM)": "SistemaCloacal",
			"Red Distribuidora de Agua Potable (AYSAM)": "RedesdeAguas"
		},
		"Equipamiento Social": {
			"Bibliotecas": "Biblioteca",
			"Centros de Jubilados": "CentrosJubilados",
			"Centros de Salud": "Centrosdesalud",
			"Clínicas Privadas": "ClinicasPrivadas",
			"Dependencias Municipales": "DependenciasMunicipales",
			"Establecimientos Educativos": "Escuelas",
			"Jardines Municipales": "JardinesMunicipales",
			"Farmacias": "Farmacias",
			"Hospitales": "Hospital",
			"Incubadora de Empresas y Escuela de Oficios": "Incubadora",
			"Instituciones de Seguridad": "Seguridad",
			"Polideportivos": "Polideportivos",
			"Puntos de Wifi": "Puntoswifi",
			"Puntos Pet Friendly": "petfriendly",
			"Residencias de Adultos Mayores": "ResidenciasAdultosMayores",
			"Uniones Vecinales": "UnionesVecinales",
			"Universidades": "Universidades"
		},
		"Patrimonio y Cultura": {
			"Barrios Históricos": "Barrios",
			"Canales": "Canales",
			"Edificios": "Edificios",
			"Esculturas": "Esculturas",
			"Diques y Planta Potabilizadora": "Diques",
			"Sitios y Conjuntos Edilicios": "SitiosyConjuntosEdilicios",
			"Tramos y Carriles": "TramosyCarriles"
		},
		"Turismo": {
			"Puestos": "Puestos",
			"Sendero Turístico - Geológico": "SenderoGeologico",
			"Bares y Comidas": "Bares",
			"Bodegas": "Bodegas",
			"Casas de Té y Café": "cafe",
			"Heladerías": "Heladerias",
			"Hospedajes": "Hospedajes",
			"Informador Turístico": "Informador",
			"Restaurantes": "Restaurantes"
		},
		"Gestión del Riesgo": {
			"Amenaza de Inundación": "Inundacion",
			"Canales Colectores Hijuelas": "CanalesColectoresHijuelas",
			"Cuencas Hidrográficas": "Cuencashidrograficas",
			"Curvas de Nivel": "Curvas",
			"Fallas Geológicas": "Fallas",
			"Red Hídrica": "RedHidrica",
			"Reservorios Urbanos": "Reservorios",
			"Subcuencas Maure": "SubcuencasMaure",
			"Suelo": "Suelo",
			"Vaso Inundación Maure": "VasoInundacionMaure"
		}
	};

	// MAPEO DE CAPAS A REFERENCIAS EN ESQUINA INFERIOR IZQUIERDA
	const layerReferences = {
		'CicloviasExistentes': 'ref_cicloviasexist',
		'CicloviasProyectadasDami': 'ref_cicloDami',
		'BarriosConsolidados': 'ref_BarriosConsolidados',
		'EspaciosVerdes': 'ref_espverdes'
	};

	// MAPEO DE CAPAS A ICONOS
	const layerIcons = {
		'Centrosdesalud': 'img/hospitales2.png',
		'centrodesalud': 'img/hospitales2.png',
		'Edificios': 'img/edificios.png',
		'SitiosyConjuntosEdilicios': 'img/sitios.png',
		'Esculturas': 'img/escultura_3.png',
		'Puntoswifi': 'img/wIfI_r2.png',
		'ClinicasPrivadas': 'img/clinicaprivada_r2.png',
		'Hospital': 'img/hospital.png',
		'Escuelas': 'img/escuela.png',
		'Farmacias': 'img/farmacias_r2.png',
		'Polideportivos': 'img/poli_r2.png',
		'JardinesMunicipales': 'img/jardmatern_r2.png',
		'Seguridad': 'img/institucseguridad_r2.png',
		'ResidenciasAdultosMayores': 'img/Esparcimiento.png',
		'PuntosRecepcionPilas': 'img/pilas_r2.png',
		'DependenciasMunicipales': 'img/dependmuni_r2.png',
		'PuntosVerdes': 'img/verde2_r2.png',
		'Solmaforos': 'img/sema_r2.png',
		'EstacionesdeServicio': 'img/gasolinera.png',
		'Estaciones': 'img/estacion.png',
		'PlantaRecicladora': 'img/marker-icon-2x-green.png',
		'Bancos': 'img/edificios.png',
		'Cajeros': 'img/atm.png',
		'Pagofacil': 'img/rapipago.png',
		'Bodegas': 'img/vino.png',
		'Informador': 'img/Oficina.png',
		'PanelesSolares': 'img/paneles_3.png',
		'ParadasMetro': 'img/tren.png',
		'Paradas': 'img/tren.png',
		'Bares': 'img/bar.png',
		'Restaurantes': 'img/resto.png',
		'cafe': 'img/cafe.png',
		'Heladerias': 'img/heladeria.png',
		'Hospedajes': 'img/hotel.png',
		'Incubadora': 'img/Oficina.png',
		'UnionesVecinales': 'img/univec_r2.png',
		'petfriendly': 'img/petfriendly.png',
		'Puestos': 'img/marker-icon-2x-red.png',
		'Diques': 'img/planta.png',
		'CentrosJubilados': 'img/Oficina.png',
		'Universidades': 'img/Enseñanza.png',
		'Biblioteca': 'img/biblio_r2.png',
		'Bicitran': 'img/bici.png',
		'Semaforos': 'img/semaforo.png',
		'SemaforosDemanda': 'img/semaforos.png'
	};

	// CARGAR CAPAS PREDEFINIDAS
	const predefinedLayers = {};
	Object.values(layerConfig).forEach(category => {
		Object.values(category).forEach(varName => {
			if (window[varName] && window[varName].type === 'FeatureCollection') {
				predefinedLayers[varName] = window[varName];
				console.log(`? Cargada: ${varName}`);
			} else {
				console.warn(` No encontrada: ${varName} (en window: ${!!window[varName]})`);
			}
		});
	});
	console.log('📍 Capas disponibles:', Object.keys(predefinedLayers).length);

	// CONTROLES
	L.control.layers(baseMaps, {}, { position: 'topleft' }).addTo(map);
	L.control.scale({ position: 'bottomleft' }).addTo(map);

	// PANEL MEJORADO CON CATEGORÍAS
	const panelHTML = `
	<div id="layer-panel" class="mobile-hidden" style="position:fixed;bottom:20px;right:20px;z-index:999;background:white;padding:0;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.25);width:360px;font-family:sans-serif;border:1px solid #ddd;max-height:600px;overflow-y:auto;display:flex;flex-direction:column;">
		<!-- Header con tabs y botón cerrar -->
		<div style="display:flex;gap:0;border-bottom:1px solid #ddd;background:#f8f8f8;border-radius:8px 8px 0 0;align-items:center;">
			<button class="panel-tab" data-tab="add" style="flex:1;padding:12px;background:#667eea;color:white;border:none;cursor:pointer;font-weight:bold;font-size:12px;border-radius:8px 0 0 0;">➕ Agregar</button>
			<button class="panel-tab" data-tab="list" style="flex:1;padding:12px;background:#f0f0f0;color:#333;border:none;cursor:pointer;font-weight:bold;font-size:12px;">📍 Capas</button>
			<button class="panel-tab" data-tab="style" style="flex:1;padding:12px;background:#f0f0f0;color:#333;border:none;cursor:pointer;font-weight:bold;font-size:12px;border-radius:0 8px 0 0;">🎨 Estilos</button>
			<button id="layer-panel-close" style="padding:8px 12px;background:none;color:#666;border:none;cursor:pointer;font-size:20px;font-weight:bold;padding-right:12px;">X</button>
		</div>

		<!-- TAB: AGREGAR CAPAS -->
		<div class="panel-content" data-tab="add" style="padding:15px;display:block;flex:1;overflow-y:auto;">
			<div style="margin-bottom:12px;">
				<label style="display:block;font-size:12px;color:#555;margin-bottom:6px;font-weight:bold;">🔍 Buscar capas:</label>
				<input type="text" id="search-layers" placeholder="Escribe para filtrar..." style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:12px;box-sizing:border-box;" />
			</div>

			<div id="categories-container" style="margin-bottom:12px;">
				<!-- Categorías dinámicas aquí -->
			</div>

			<div style="border-top:1px solid #ddd;padding-top:12px;">
				<label style="display:block;font-size:12px;color:#555;margin-bottom:6px;font-weight:bold;">📁 O carga archivo GeoJSON:</label>
				<input type="file" id="geojson-input" accept=".geojson,.json" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:12px;box-sizing:border-box;" />
			</div>
		</div>

		<!-- TAB: CAPAS CARGADAS -->
		<div class="panel-content" data-tab="list" style="padding:15px;display:none;flex:1;overflow-y:auto;">
			<div style="margin-bottom:8px;">
				<label style="display:block;font-size:12px;color:#555;margin-bottom:8px;font-weight:bold;">Capas cargadas:</label>
			</div>
			<div id="available-layers" style="border:1px solid #eee;border-radius:4px;padding:8px;background:#fafafa;min-height:100px;">
				<p style="color:#999;font-size:12px;margin:0;">Sin capas cargadas</p>
			</div>
		</div>

		<!-- TAB: EDITOR DE ESTILOS -->
		<div class="panel-content" data-tab="style" style="padding:15px;display:none;flex:1;overflow-y:auto;">
			<div style="margin-bottom:12px;">
				<label style="display:block;font-size:12px;color:#555;margin-bottom:6px;font-weight:bold;">Seleccionar capa:</label>
				<select id="style-layer-select" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:12px;box-sizing:border-box;">
					<option value="">-- Seleccionar capa --</option>
				</select>
			</div>

			<div style="margin-bottom:12px;">
				<label style="display:block;font-size:12px;color:#555;margin-bottom:6px;font-weight:bold;">🎨 Color:</label>
				<input type="color" id="style-color" value="#FF6B6B" style="width:100%;height:35px;border:1px solid #ddd;border-radius:4px;cursor:pointer;" />
			</div>

			<div style="margin-bottom:12px;">
				<label style="display:block;font-size:12px;color:#555;margin-bottom:6px;font-weight:bold;">💧 Opacidad: <span id="opacity-value">80</span>%</label>
				<input type="range" id="style-opacity" min="0" max="100" value="80" style="width:100%;cursor:pointer;" />
			</div>

			<div style="margin-bottom:12px;">
				<label style="display:block;font-size:12px;color:#555;margin-bottom:6px;font-weight:bold;">📏 Grosor línea: <span id="weight-value">2</span>px</label>
				<input type="range" id="style-weight" min="1" max="10" value="2" style="width:100%;cursor:pointer;" />
			</div>

			<button id="apply-style-btn" style="width:100%;padding:10px;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-size:12px;">
				✓ Aplicar estilos
			</button>
		</div>
	</div>
	`;

	document.body.insertAdjacentHTML('beforeend', panelHTML);

	// AGREGAR BOTÓN TOGGLE PARA MÓVILES
	const toggleButtonHTML = `<button id="layer-panel-toggle-btn" style="display:none;position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;border:none;font-size:24px;cursor:pointer;box-shadow:0 4px 12px rgba(102, 126, 234, 0.4);z-index:1002;transition:all 0.3s ease;align-items:center;justify-content:center;">👁️</button>`;
	document.body.insertAdjacentHTML('beforeend', toggleButtonHTML);

	// DETECTAR SI ES MÓVIL Y CONFIGURAR PANEL
	const layerPanel = document.getElementById('layer-panel');
	const layerPanelToggleBtn = document.getElementById('layer-panel-toggle-btn');
	const layerPanelCloseBtn = document.getElementById('layer-panel-close');
	const isMobile = () => window.innerWidth <= 768;

	// Función para mostrar/ocultar panel
	const toggleLayerPanel = () => {
		layerPanel.classList.toggle('mobile-visible');
		layerPanel.classList.toggle('mobile-hidden');
	};

	// Configuración inicial y responsive
	const updatePanelState = () => {
		if (isMobile()) {
			// En móvil: mostrar botón toggle y ocultar panel por defecto
			layerPanelToggleBtn.style.display = 'flex';
			layerPanel.classList.add('mobile-hidden');
			layerPanel.classList.remove('mobile-visible');
		} else {
			// En desktop: ocultar botón toggle y mostrar panel
			layerPanelToggleBtn.style.display = 'none';
			layerPanel.classList.remove('mobile-hidden');
			layerPanel.classList.remove('mobile-visible');
			layerPanel.style.display = 'flex';
		}
	};

	// Inicializar estado
	updatePanelState();

	// Escuchar cambios de tamaño de ventana
	window.addEventListener('resize', updatePanelState);

	// Eventos del botón toggle
	layerPanelToggleBtn.addEventListener('click', () => {
		toggleLayerPanel();
	});

	// Botón cerrar panel en móvil
	layerPanelCloseBtn.addEventListener('click', () => {
		if (isMobile()) {
			layerPanel.classList.add('mobile-hidden');
			layerPanel.classList.remove('mobile-visible');
		}
	});

	// ELEMENTOS DEL PANEL
	const layerSearchInput = document.getElementById('search-layers');
	const categoriesContainer = document.getElementById('categories-container');
	const geojsonInput = document.getElementById('geojson-input');
	const availableLayers = document.getElementById('available-layers');
	const styleLayerSelect = document.getElementById('style-layer-select');
	const styleColorInput = document.getElementById('style-color');
	const styleOpacitySlider = document.getElementById('style-opacity');
	const styleWeightSlider = document.getElementById('style-weight');
	const applyStyleBtn = document.getElementById('apply-style-btn');

	// TABS
	document.querySelectorAll('.panel-tab').forEach(tab => {
		tab.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			
			const tabName = tab.dataset.tab;
			
			document.querySelectorAll('.panel-tab').forEach(t => {
				t.style.background = '#f0f0f0';
				t.style.color = '#333';
			});
			tab.style.background = '#667eea';
			tab.style.color = 'white';

			document.querySelectorAll('.panel-content').forEach(c => {
				if (c.getAttribute('data-tab') === tabName) {
					c.style.display = 'block';
				} else {
					c.style.display = 'none';
				}
			});
		});
	});

	// RENDERIZAR CATEGORÍAS
	const renderCategories = (filterText = '') => {
		categoriesContainer.innerHTML = '';
		Object.keys(layerConfig).forEach(categoryName => {
			const category = layerConfig[categoryName];
			const filteredLayers = Object.entries(category).filter(([displayName]) => 
				displayName.toLowerCase().includes(filterText.toLowerCase())
			);

			if (filteredLayers.length === 0) return;

			const categoryDiv = document.createElement('div');
			categoryDiv.style.cssText = `margin-bottom:12px;border:1px solid #e0e0e0;border-radius:4px;overflow:hidden;`;
			categoryDiv.innerHTML = `<div style="background:#f5f5f5;padding:8px;font-weight:bold;font-size:11px;color:#555;border-bottom:1px solid #ddd;">${categoryName}</div>`;

			const layersDiv = document.createElement('div');
			layersDiv.style.cssText = 'padding:6px;';

			filteredLayers.forEach(([displayName, varName]) => {
				const btn = document.createElement('button');
				btn.style.cssText = `width:100%;padding:8px;margin:4px 0;background:#f9f9f9;border:1px solid #ddd;border-radius:3px;cursor:pointer;font-size:12px;text-align:left;transition:all 0.2s;`;
				btn.textContent = displayName;
				btn.onmouseover = () => btn.style.background = '#e8e8ff';
				btn.onmouseout = () => btn.style.background = '#f9f9f9';
				btn.addEventListener('click', () => {
					if (!layers[varName]) {
						addLayerToMap(varName, displayName, predefinedLayers[varName] || window[varName]);
						updateLayerList();
					} else {
						alert(' Capa ya cargada');
					}
				});
				layersDiv.appendChild(btn);
			});

			categoryDiv.appendChild(layersDiv);
			categoriesContainer.appendChild(categoryDiv);
		});
	};

	renderCategories();

	// BUSQUEDA Y FILTRADO
	layerSearchInput.addEventListener('input', (e) => {
		renderCategories(e.target.value);
	});

	// CARGAR GEOJSON DESDE ARCHIVO
	geojsonInput.addEventListener('change', (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const geojsonData = JSON.parse(event.target.result);
				const name = file.name.replace('.geojson', '').replace('.json', '');
				addLayerToMap(name, name, geojsonData);
				geojsonInput.value = '';
				updateLayerList();
			} catch (err) {
				alert('? Error: ' + err.message);
			}
		};
		reader.readAsText(file);
	});

	// ACTUALIZAR SLIDERS DE ESTILOS
	styleOpacitySlider.addEventListener('input', (e) => {
		document.getElementById('opacity-value').textContent = e.target.value;
	});

	styleWeightSlider.addEventListener('input', (e) => {
		document.getElementById('weight-value').textContent = e.target.value;
	});

	// APLICAR ESTILOS
	applyStyleBtn.addEventListener('click', () => {
		const layerName = styleLayerSelect.value;
		if (!layerName || !layers[layerName]) {
			alert('👁️ Selecciona una capa');
			return;
		}

		const color = styleColorInput.value;
		const opacity = styleOpacitySlider.value / 100;
		const weight = parseInt(styleWeightSlider.value);

		layerStyles[layerName] = { color, opacity, weight };
		applyLayerStyle(layerName, { color, opacity, weight });
		alert('Estilos aplicados');
	});

	// MAPEO DE IMÁGENES PARA POPUPS
	// FUNCIÓN PARA AGREGAR CAPA
	const addLayerToMap = (varName, displayName, geojsonData) => {
		if (!geojsonData) {
			alert('? No se encontró el GeoJSON');
			console.error(`? GeoJSON no encontrado para: ${varName}`);
			return;
		}

		// Limitar máximo de capas simultáneamente (prevenir memory leak)
		while (Object.keys(layers).length >= MAX_ACTIVE_LAYERS) {
			// Auto-eliminar la capa más antigua (FIFO)
			const oldestLayer = layerStack.shift();
			if (oldestLayer && layers[oldestLayer]) {
				try {
					const oldLayer = layers[oldestLayer];
					
					// Remover del mapa
					if (map.hasLayer(oldLayer.layer)) {
						map.removeLayer(oldLayer.layer);
					}
					
					// Limpiar datos GeoJSON de la capa
					if (oldLayer.layer._layers) {
						oldLayer.layer._layers = {};
					}
					if (oldLayer.layer._geoJsonData) {
						oldLayer.layer._geoJsonData = null;
					}
					
					// Eliminar de objetos globales
					delete layers[oldestLayer];
					delete layerStyles[oldestLayer];
					
					console.warn(`🗑️ Capa más antigua "${oldestLayer}" eliminada automáticamente (memory cleanup)`);
				} catch (e) {
					console.error('Error eliminando capa:', oldestLayer, e);
				}
			}
		}

		// Agregar nueva capa a la pila
		layerStack.push(varName);
		console.log(`👁️ Agregando capa "${varName}" con ${geojsonData.features?.length || 0} features (${Object.keys(layers).length + 1}/${MAX_ACTIVE_LAYERS} activas)`);

		const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#FF8B94'];
		const randomColor = colors[Math.floor(Math.random() * colors.length)];
		layerStyles[varName] = { color: randomColor, opacity: 0.4, weight: 2 };

		// MAPEO DE COLORES PARA TRAZA
		const trazaColorMap = {
			'1': '#FF0000',      // Malo - Rojo
			'2': '#FF9900',      // Regular - Naranja
			'3': '#FFFF00',      // Bueno - Amarillo
			'4': '#00AA00'       // Óptimo - Verde
		};

		// FUNCIÓN PARA OBTENER ESTILO SEGÚN TIPO DE CAPA
		const getStyle = (feature) => {
			// ========== ESPACIOS VERDES - COLOR VERDE FIJO ==========
			if (varName === 'EspaciosVerdes') {
				return {
					color: '#006633',
					weight: 2,
					opacity: 1,
					fillColor: '#00AA00',
					fillOpacity: 0.7
				};
			}

			// ========== RED HÍDRICA - COLOR CELESTE FIJO ==========
			if (varName === 'RedHidrica') {
				return {
					color: '#0066CC',
					weight: 3,
					opacity: 1,
					fillColor: '#00CCFF',
					fillOpacity: 0.6
				};
			}

			// ========== DISTRITOS DEPARTAMENTALES - COLORES POR qc_id ==========
			if (varName === 'DistritosDepartamentales') {
				const distritosColorsById = {
					'1': '#FF9999',
					'2': '#99FF99',
					'3': '#9999FF',
					'4': '#FFFF99',
					'5': '#FF99FF',
					'6': '#99FFFF',
					'7': '#FFCC99',
					'8': '#CC99FF',
					'9': '#99CCCC'
				};
				
				const qcId = String(feature.properties.qc_id || feature.properties.QC_ID || 'gray');
				const color = distritosColorsById[qcId] || '#999999';
				
				return {
					color: '#333',
					weight: 2,
					opacity: 1,
					fillColor: color,
					fillOpacity: 0.6
				};
			}

			// ========== ZONIFICACIÓN - COLORES POR LAYER ==========
			if (varName === 'Zonificacion') {
				const zonificacionColorsByLayer = {
					'RESIDENCIAL': '#FF6633',
					'RESIDENCIAL MIXTA': '#88DDFF',
					'COMERCIAL': '#0099FF',
					'COMERCIAL MIXTA': '#66FF66',
					'CENTRO CIVICO': '#FFFF33',
					'PARQUE RECREACION': '#009900',
					'EXTENSION INDUSTRIAL': '#9933FF',
					'INDUSTRIAL1': '#CC9966',
					'INDUSTRIAL2': '#999999'
				};
				
				const layer = String(feature.properties.Layer || '').trim();
				const color = zonificacionColorsByLayer[layer];
				
				return {
					color: '#333',
					weight: 2,
					opacity: 1,
					fillColor: color || '#999999',
					fillOpacity: 0.6
				};
			}

			// ========== AMENAZA DE INUNDACIÓN - GAMA DE AZULES SEGÚN ID ==========
			if (varName === 'Inundacion' || varName === 'Amenaza de Inundación') {
				const inundacionColorsById = {
					'1': '#ADD8E6',      // Azul claro - Amenaza Baja
					'2': '#4682B4',      // Azul intermedio - Amenaza Media
					'3': '#00008B',      // Azul oscuro - Amenaza Alta
					'4': '#00008B'       // Azul oscuro - Amenaza Alta (igual a 3)
				};
				
				const amenazaId = String(feature.properties.id || feature.properties.ID || feature.properties.fid || 'gray');
				const color = inundacionColorsById[amenazaId] || '#999999';
				
				return {
					color: '#333',
					weight: 2,
					opacity: 1,
					fillColor: color,
					fillOpacity: 0.7
				};
			}

			// ========== ZONA A (LEY 9.414) - CON TRAMA ROJA ==========
			if (varName === 'ZonaA') {
				return {
					color: '#CC0000',      // Rojo oscuro para el borde
					weight: 3,
					opacity: 1,
					dashArray: '5, 5',     // Línea discontinua para efecto de trama
					fillColor: '#FF9999',  // Rojo claro para el relleno
					fillOpacity: 0.5
				};
			}

			// ========== ZONA B (LEY 9.414) - CON TRAMA AMARILLA ==========
			if (varName === 'ZonaB') {
				return {
					color: '#CC9900',      // Naranja oscuro para el borde
					weight: 3,
					opacity: 1,
					dashArray: '5, 5',     // Línea discontinua para efecto de trama
					fillColor: '#FFFF99',  // Amarillo claro para el relleno
					fillOpacity: 0.5
				};
			}

			// ========== CICLOVÍAS EXISTENTES - COLOR ROJO ==========
			if (varName === 'CicloviasExistentes') {
				return {
					color: '#FF0000',      // Rojo
					weight: 4,             // Grosor intermedio
					opacity: 0.9,
					lineCap: 'round',
					lineJoin: 'round'
				};
			}

			// ========== CICLOVÍAS PROYECTADAS - COLOR AMARILLO FUERTE CON LÍNEA DISCONTINUA ==========
			if (varName === 'CicloviasProyectadasDami') {
				return {
					color: '#FFCC00',      // Amarillo más fuerte
					weight: 4,             // Grosor intermedio
					opacity: 0.8,
					dashArray: '8, 4',     // Línea discontinua para indicar "proyectada"
					lineCap: 'round',
					lineJoin: 'round'
				};
			}

			// ========== METROTRANVÍA - COLOR VIOLETA ==========
			if (varName === 'Metrotranvia') {
				return {
					color: '#9933FF',      // Violeta
					weight: 4.5,           // Grosor intermedio
					opacity: 0.95,
					lineCap: 'round',
					lineJoin: 'round'
				};
			}

			// ========== TRAZA FUTURA DE METROTRANVÍA - COLOR NARANJA FUERTE CON LÍNEA DISCONTINUA ==========
			if (varName === 'MetroFuturo') {
				return {
					color: '#FF6600',      // Naranja fuerte
					weight: 4.5,           // Grosor intermedio
					opacity: 0.8,
					dashArray: '8, 4',     // Línea discontinua para indicar "futura"
					lineCap: 'round',
					lineJoin: 'round'
				};
			}

			// ========== RED COLECTORA CLOACAL - COLORES POR ID ==========
			if (varName === 'SistemaCloacal') {
				const cloacalColorsById = {
					'1': '#0099FF',        // ID 1: Azul/Celeste más fuerte
					'2': '#FF9900',        // ID 2: Naranja
					'3': '#FF0000'         // ID 3: Rojo
				};
			
				const cloacalId = String(feature.properties.id || feature.properties.ID || feature.properties.fid || '1');
				const color = cloacalColorsById[cloacalId] || '#0099FF';
			
				return {
					color: color,
					weight: 3,
					opacity: 0.85,
					lineCap: 'round',
					lineJoin: 'round'
				};
			}

			// ========== RED DISTRIBUIDORA DE AGUA POTABLE - COLORES POR ID ==========
			if (varName === 'RedesdeAguas') {
				const aguaColorsById = {
					'1': '#0099FF',        // ID 1: Azul/Celeste más fuerte
					'2': '#FF9900',        // ID 2: Naranja
					'3': '#FF0000'         // ID 3: Rojo
				};
			
				const aguaId = String(feature.properties.id || feature.properties.ID || feature.properties.fid || '1');
				const color = aguaColorsById[aguaId] || '#0099FF';
			
				return {
					color: color,
					weight: 3,
					opacity: 0.85,
					lineCap: 'round',
					lineJoin: 'round'
				};
			}

			// ========== TRAZA (ÍNDICE DE CAMINABILIDAD) ==========
			if (varName === 'Traza') {
				const promedio = String(feature.properties.PROMEDIO_P);
				const color = trazaColorMap[promedio] || '#808080';
				return {
					color: color,
					weight: 3,
					opacity: 0.9,
					fillOpacity: 0.7
				};
			}

			// ========== ESTILO POR DEFECTO PARA OTRAS CAPAS ==========
			return {
				color: randomColor,
				weight: 2,
				opacity: 0.8,
				fillOpacity: 0.4
			};
		};

		const layer = L.geoJson(geojsonData, {
			style: (feature) => getStyle(feature),
			pointToLayer: (f, ll) => {
				// Si la capa tiene un icono, usar ícono personalizado
				if (layerIcons[varName]) {
					// Iconos que usan la configuración estándar [25, 41]
					const standardIconLayers = [
						'Biblioteca', 'Esculturas', 'centrodesalud', 'Centrosdesalud', 'ClinicasPrivadas',
						'DependenciasMunicipales', 'Escuelas', 'Farmacias', 'Hospital',
						'Seguridad', 'JardinesMunicipales', 'Polideportivos', 'Semaforos',
						'PuntosRecepcionPilas', 'Universidades', 'Puntoswifi', 'PanelesSolares',
						'PuntosVerdes', 'SitiosyConjuntosEdilicios', 'Edificios', 'ResidenciasAdultosMayores',
						'CentrosJubilados', 'Diques', 'PlantaRecicladora', 'Bancos', 'UnionesVecinales', 'petfriendly'
					];
					
					// Iconos más pequeños
					const smallIconLayers = ['Cajeros', 'Farmacias', 'Bares', 'cafe', 'Heladerias', 'Pagofacil', 'Puntoswifi', 'Bodegas', 'ParadasMetro', 'Paradas'];
					
					let iconSize = [39, 42];      // Tamaño por defecto
					let iconAnchor = [12, 41];
					
					if (standardIconLayers.includes(varName)) {
						iconSize = [25, 41];
					} else if (smallIconLayers.includes(varName)) {
						iconSize = [31, 35];
						iconAnchor = [12, 41];
					}
					
					return L.marker(ll, {
						icon: L.icon({
							iconUrl: layerIcons[varName],
							iconSize: iconSize,
							shadowUrl: 'img/marker-shadow.png',
							shadowSize: [41, 41],
							iconAnchor: iconAnchor,
							popupAnchor: [1, -34]
						})
					});
				}
				// Si no, usar circleMarker por defecto
				return L.circleMarker(ll, { 
					radius: 6, 
					fillColor: randomColor, 
					color: '#fff', 
					weight: 2, 
					opacity: 1, 
					fillOpacity: 0.8 
				});
			},
			onEachFeature: (f, l) => {
				// Solo mostrar popup si NO es Traza
				if (varName !== 'Traza' && f.properties) {
					const popupContent = generatePopupContent(f, varName);
					l.bindPopup(popupContent);
				}
			}
		}).addTo(map);

		layers[varName] = { layer, displayName };
		const count = geojsonData.features?.length || 0;
		console.log(`? "${displayName}" agregada con ${count} features`);
		
		// Crear leyenda si es Traza
		if (varName === 'Traza') {
			createTrazaLegend();
		}
		
		updateReferences();
	};

	// CREAR LEYENDA PARA TRAZA EN EL CENTRO INFERIOR DEL MAPA
	let trazaLegendElement = null;
	const createTrazaLegend = () => {
		// Eliminar leyenda anterior si existe
		if (trazaLegendElement) {
			trazaLegendElement.remove();
		}

		trazaLegendElement = document.createElement('div');
		trazaLegendElement.id = 'traza-legend';
		trazaLegendElement.style.cssText = `
			position: fixed;
			bottom: 15px;
			left: 50%;
			transform: translateX(-50%);
			background: white;
			padding: 15px;
			border-radius: 5px;
			box-shadow: 0 2px 8px rgba(0,0,0,0.2);
			font-family: Arial, sans-serif;
			z-index: 999;
			max-width: 200px;
			pointer-events: auto;
		`;

		const title = '<div style="font-weight:bold;margin-bottom:10px;font-size:14px;color:#333;"> Índice Final de<br>Caminabilidad</div>';
		
		const items = [
			{ color: '#00AA00', label: 'Óptimo' },
			{ color: '#FFFF00', label: 'Bueno' },
			{ color: '#FF9900', label: 'Regular' },
			{ color: '#FF0000', label: 'Malo' }
		];

		let html = title;
		items.forEach(item => {
			html += `
				<div style="display:flex;align-items:center;margin:6px 0;">
					<div style="width:20px;height:20px;background:${item.color};border:2px solid #333;margin-right:10px;border-radius:3px;"></div>
					<span style="font-size:12px;color:#333;font-weight:bold;">${item.label}</span>
				</div>
			`;
		});

		trazaLegendElement.innerHTML = html;
		document.body.appendChild(trazaLegendElement);
	};

	// ELIMINAR LEYENDA CUANDO SE QUITA TRAZA
	const removeTrazaLegend = () => {
		if (trazaLegendElement) {
			trazaLegendElement.remove();
			trazaLegendElement = null;
		}
	};


	// FUNCIÓN PARA ACTUALIZAR REFERENCIAS EN ESQUINA INFERIOR
	const updateReferences = () => {
		Object.values(layerReferences).forEach(refId => {
			const ref = document.getElementById(refId);
			if (ref) ref.classList.remove('active');
		});

		Object.entries(layerReferences).forEach(([varName, refId]) => {
			if (layers[varName] && map.hasLayer(layers[varName].layer)) {
				const ref = document.getElementById(refId);
				if (ref) ref.classList.add('active');
			}
		});
	};

	// APLICAR ESTILOS A CAPA
	const applyLayerStyle = (varName, style) => {
		if (!layers[varName]) return;
		
		layers[varName].layer.eachLayer(layer => {
			if (layer.setStyle) {
				layer.setStyle({
					color: style.color,
					opacity: style.opacity,
					weight: style.weight,
					fillOpacity: style.opacity * 0.5
				});
			} else if (layer.setRadius) {
				layer.setStyle({ fillColor: style.color, fillOpacity: style.opacity });
			}
		});
	};

	// ACTUALIZAR LISTA DE CAPAS
	const updateLayerList = () => {
		const names = Object.keys(layers);
		if (names.length === 0) {
			availableLayers.innerHTML = '<p style="color:#999;font-size:12px;margin:0;">Sin capas cargadas</p>';
			styleLayerSelect.innerHTML = '<option value="">-- Seleccionar capa --</option>';
			return;
		}

		availableLayers.innerHTML = '';
		names.forEach(varName => {
			// Excluir godoycruz del panel de capas (siempre está activo)
			if (varName === 'godoycruz') return;
			
			const { layer, displayName } = layers[varName];
			const isVisible = map.hasLayer(layer);
			const count = layer._layers ? Object.keys(layer._layers).length : 0;
			
			const btn = document.createElement('div');
			btn.className = 'layer-item';
			btn.setAttribute('data-layer', varName);
			btn.style.cssText = `padding:8px;margin:4px 0;background:${isVisible ? '#d4f1d4' : '#f5f5f5'};border:1px solid #ddd;border-radius:3px;font-size:12px;`;
			btn.innerHTML = `
				<div style="display:flex;justify-content:space-between;align-items:center;">
					<span class="layer-name" style="cursor:pointer;flex:1;"><b>${displayName}</b></span>
					<div style="display:flex;gap:6px;">
						<button class="download-layer" style="padding:4px 8px;background:#4CAF50;color:white;border:none;border-radius:3px;cursor:pointer;font-size:14px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;" title="Descargar capa">⬇️</button>
						<button class="toggle-visibility" style="padding:4px 8px;background:#667eea;color:white;border:none;border-radius:3px;cursor:pointer;font-size:14px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;" title="Alternar visibilidad">${isVisible ? '👁️' : '🚫'}</button>
						<button class="delete-layer" style="padding:4px 8px;background:#ff6b6b;color:white;border:none;border-radius:3px;cursor:pointer;font-size:11px;width:30px;" title="Eliminar capa">🗑️</button>
					</div>
				</div>
				<div style="font-size:11px;color:#666;margin-top:2px;">${count} features</div>
			`;

			availableLayers.appendChild(btn);
		});

		// DELEGACIÓN DE EVENTOS - Se ejecuta una sola vez
		availableLayers.onclick = (e) => {
			const layerItem = e.target.closest('.layer-item');
			if (!layerItem) return;
			
			const varName = layerItem.getAttribute('data-layer');
			const layer = layers[varName].layer;
			
			// Botón toggle
			if (e.target.classList.contains('toggle-visibility')) {
				e.stopPropagation();
				if (map.hasLayer(layer)) {
					map.removeLayer(layer);
					layerItem.style.background = '#f5f5f5';
					e.target.textContent = '🚫';
				} else {
					map.addLayer(layer);
					layerItem.style.background = '#d4f1d4';
					e.target.textContent = '👁️';
				}
				updateReferences();
			}
			
			// Botón eliminar
			else if (e.target.classList.contains('delete-layer')) {
				e.stopPropagation();
				map.removeLayer(layer);
				
				// Eliminar leyenda si es Traza
				if (varName === 'Traza') {
					removeTrazaLegend();
				}
				
				// Limpiar referencias al layer
				delete layers[varName];
				delete layerStyles[varName];
				
				// Remover del stack
				const idx = layerStack.indexOf(varName);
				if (idx > -1) layerStack.splice(idx, 1);
				
				updateLayerList();
				updateReferences();
				console.log(`🗑️ Capa "${varName}" eliminada`);
			}

			// Botón descargar
			else if (e.target.classList.contains('download-layer')) {
				e.stopPropagation();
				showDownloadMenu(varName, layers[varName].displayName);
			}
			
			// Click en nombre también alterna visibilidad
			else if (e.target.classList.contains('layer-name')) {
				if (map.hasLayer(layer)) {
					map.removeLayer(layer);
					layerItem.style.background = '#f5f5f5';
					layerItem.querySelector('.toggle-visibility').textContent = '🚫';
				} else {
					map.addLayer(layer);
					layerItem.style.background = '#d4f1d4';
					layerItem.querySelector('.toggle-visibility').textContent = '👁️';
				}
				updateReferences();
			}
		};

		styleLayerSelect.innerHTML = '<option value="">-- Seleccionar capa --</option>';
		names.forEach(varName => {
			// Excluir godoycruz del editor de estilos
			if (varName === 'godoycruz') return;
			
			const option = document.createElement('option');
			option.value = varName;
			option.textContent = layers[varName].displayName;
			styleLayerSelect.appendChild(option);
		});
	};

	// EVENT LISTENER PARA STYLE SELECT (ejecutado una sola vez)
	styleLayerSelect.addEventListener('change', () => {
		const varName = styleLayerSelect.value;
		if (varName && layerStyles[varName]) {
			const style = layerStyles[varName];
			styleColorInput.value = style.color;
			styleOpacitySlider.value = Math.round(style.opacity * 100);
			styleWeightSlider.value = style.weight;
			document.getElementById('opacity-value').textContent = styleOpacitySlider.value;
			document.getElementById('weight-value').textContent = styleWeightSlider.value;
		}
	});

	console.log(`? Panel listo. ${Object.values(layerConfig).reduce((sum, cat) => sum + Object.keys(cat).length, 0)} capas disponibles`);

	// ---------------------------------------------------------------
	// BOTONES DE UTILIDADES
	// ---------------------------------------------------------------

	// ESTADO PARA MODO STREET VIEW
	let streetViewMode = false;
	let streetViewMarker = null;
	let streetViewLatLng = null;

	// BOTÓN: MAPA INDICADORES URBANOS
	const btnIndicadores = document.getElementById('btn-indicadores');
	btnIndicadores.addEventListener('click', () => {
		window.open('https://observatorio-gc.github.io/Indicadores-Urbanos/', '_blank');
		console.log('🗑️ Abriendo Mapa de Indicadores Urbanos');
	});

	// BOTÓN: STREET VIEW
	const btnStreetView = document.getElementById('btn-streetview');
	const streetViewIndicator = document.getElementById('streetview-mode-indicator');

	btnStreetView.addEventListener('click', () => {
		streetViewMode = !streetViewMode;
		
		if (streetViewMode) {
			// Activar modo Street View
			btnStreetView.style.background = '#C20668';
			streetViewIndicator.classList.add('active');
			console.log('👁️ Modo Street View ACTIVADO - Haz clic en el mapa para seleccionar posición');
		} else {
			// Desactivar modo Street View
			btnStreetView.style.background = '#da0c81';
			streetViewIndicator.classList.remove('active');
			
			// Eliminar marcador de Street View si existe
			if (streetViewMarker && map.hasLayer(streetViewMarker)) {
				map.removeLayer(streetViewMarker);
				streetViewMarker = null;
			}
			streetViewLatLng = null;
			console.log('👁️ Modo Street View DESACTIVADO');
		}
	});

	// LISTENER PARA CLICK EN MAPA EN MODO STREET VIEW
	map.on('click', (e) => {
		if (!streetViewMode) return;

		const lat = L.Util.formatNum(e.latlng.lat, 6);
		const lng = L.Util.formatNum(e.latlng.lng, 6);
		streetViewLatLng = { lat, lng };

		// Remover marcador anterior
		if (streetViewMarker && map.hasLayer(streetViewMarker)) {
			map.removeLayer(streetViewMarker);
		}

		// Crear nuevo marcador amarillo de Street View
		streetViewMarker = L.marker(e.latlng, {
			icon: L.icon({
				iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAzMiA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iNDEiIHJ4PSI0IiBmaWxsPSIjRkZENzAwIi8+PHBvbHlnb24gcG9pbnRzPSIxNiw4IDE0LDIwIDMyLDIwIiBmaWxsPSIjRkZENzAwIi8+PHRleHQgeD0iMTYiIHk9IjI4IiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMzMzIj7wn4yOPC90ZXh0Pjwvc3ZnPg==',
				iconSize: [32, 41],
				iconAnchor: [16, 41],
				popupAnchor: [0, -41]
			}),
			draggable: true,
			title: 'Street View - Arrastra para mover'
		}).addTo(map).bindPopup(`
			<div style="text-align: center; font-size: 12px;">
				<b>🗺️ Street View</b><br>
				Lat: ${lat}<br>
				Lng: ${lng}<br>
				<button onclick="openStreetView('${lat}', '${lng}')" style="margin-top: 8px; padding: 6px 12px; background: #4285F4; color: white; border: none; border-radius: 3px; cursor: pointer;">
					🗺️ Abrir en Google Maps
				</button>
			</div>
		`, { maxWidth: 220 }).openPopup();

		console.log(`👁️ Posición Street View: ${lat}, ${lng}`);

		// Permitir mover el marcador y actualizar el popup
		streetViewMarker.on('dragend', () => {
			const newLatLng = streetViewMarker.getLatLng();
			streetViewLatLng = {
				lat: L.Util.formatNum(newLatLng.lat, 6),
				lng: L.Util.formatNum(newLatLng.lng, 6)
			};
			
			// Actualizar popup con nuevas coordenadas
			streetViewMarker.setPopupContent(`
				<div style="text-align: center; font-size: 12px;">
					<b>🗺️ Street View</b><br>
					Lat: ${streetViewLatLng.lat}<br>
					Lng: ${streetViewLatLng.lng}<br>
					<button onclick="openStreetView('${streetViewLatLng.lat}', '${streetViewLatLng.lng}')" style="margin-top: 8px; padding: 6px 12px; background: #4285F4; color: white; border: none; border-radius: 3px; cursor: pointer;">
						🗺️ Abrir en Google Maps
					</button>
				</div>
			`).openPopup();
			
			console.log(`👁️ Posición actualizada: ${streetViewLatLng.lat}, ${streetViewLatLng.lng}`);
		});
	});

	// FUNCIÓN GLOBAL PARA ABRIR STREET VIEW
	window.openStreetView = (lat, lng) => {
		const url = `https://www.google.com/maps?layer=c&cbll=${lat},${lng}`;
		window.open(url, '_blank');
		console.log(`👁️ Street View abierto: ${url}`);
	};

	// ---------------------------------------------------------------
	// BÚSQUEDA GLOBAL EN GEOJSON
	// ---------------------------------------------------------------

	const searchInput = document.getElementById('global-search-input');
	const searchResultsContainer = document.getElementById('search-results');
	let searchTimeout;

	// Solo iniciar búsqueda si los elementos existen
	if (searchInput && searchResultsContainer) {
		// ---------------------------------------------------------------
		// CONFIGURACIÓN DE BÚSQUEDA MEJORADA
		// ---------------------------------------------------------------

		// Campos a buscar en cada capa (se intenta en este orden)
		const searchFields = [
			// Nombres
			'Nombre', 'Nombre_1', 'name', 'NAME', 'Name', 
			'NOMBRE',  // EspaciosVerdes
			'nombre',
			// Direcciones
			'domicilio', 'Direccion', 'DIRECCION', 'Dirección', 'direccion',
			// Teléfono
			'Telefono', 'TELEFONO', 'telefono', 'tel', 'Tel',
			// Email y otros
			'email', 'Email', 'EMAIL',
			'Gestion', 'Nivel', 'Distrito',
			// Otros campos
			'Descriptio', 'encargado', 'horario', 'jurisdicci'
		];

		// Obtener sugerencias de autocomplete
		const getAutocompleteSuggestions = (query, selectedCategory = '') => {
			const term = query.toLowerCase();
			const suggestions = new Map();

			Object.entries(layerConfig).forEach(([category, categoryLayers]) => {
				// Si hay categoría seleccionada, filtrar por esa
				if (selectedCategory && category !== selectedCategory) return;

				Object.entries(categoryLayers).forEach(([displayName, varName]) => {
					const geoJsonData = window[varName];
					
					if (geoJsonData && geoJsonData.features) {
						geoJsonData.features.forEach((feature, idx) => {
							const props = feature.properties || {};
							
							for (const field of searchFields) {
								const value = props[field];
								if (value && typeof value === 'string') {
									const strValue = value.toLowerCase();
									if (strValue.includes(term) && strValue.length < 50) {
										const key = value.substring(0, 40);
										if (!suggestions.has(key)) {
											suggestions.set(key, { value, displayName, varName });
										}
									}
								}
							}
						});
					}
				});
			});

			return Array.from(suggestions.values()).slice(0, 8);
		};

		// Función para buscar en todas las capas disponibles
		const performGlobalSearch = (query, selectedCategory = '') => {
			if (!query || query.trim().length < 2) {
				searchResultsContainer.classList.remove('active');
				return;
			}

			const results = [];
			const searchTerm = query.toLowerCase();

			// Buscar en todas las capas del layerConfig
			Object.entries(layerConfig).forEach(([category, categoryLayers]) => {
				// Si hay categoría seleccionada, filtrar por esa
				if (selectedCategory && category !== selectedCategory) return;

				Object.entries(categoryLayers).forEach(([displayName, varName]) => {
					const geoJsonData = window[varName];
					
					if (geoJsonData && geoJsonData.features) {
						geoJsonData.features.forEach((feature, idx) => {
							const props = feature.properties || {};
							let match = false;
							let matchedField = '';
							let matchedValue = '';

							// Buscar en todos los campos configurados
							for (const field of searchFields) {
								const value = props[field];
								if (value && typeof value === 'string') {
									if (value.toLowerCase().includes(searchTerm)) {
										match = true;
										matchedField = field;
										matchedValue = value;
										break;
									}
								}
							}

							if (match) {
								// Obtener nombre principal del resultado
								let resultName = '';
								for (const field of ['Nombre', 'Nombre_1', 'name', 'NAME']) {
									if (props[field]) {
										resultName = props[field];
										break;
									}
								}

								// Obtener detalles adicionales
								let resultDetail = '';
								if (props.domicilio) resultDetail = props.domicilio;
								else if (props.Direccion) resultDetail = props.Direccion;
								else if (matchedValue !== resultName) resultDetail = matchedValue;

								results.push({
									category,
									displayName,
									varName,
									featureIndex: idx,
									name: resultName || matchedValue,
									detail: resultDetail,
									feature: feature,
									coordinates: feature.geometry?.coordinates
								});
							}
						});
					}
				});
			});

			// Mostrar resultados
			displaySearchResults(results, query);
		};

		// Función para mostrar resultados + autocomplete
		const displaySearchResults = (results, query) => {
			searchResultsContainer.innerHTML = '';
			const selectedCategory = document.getElementById('search-category-filter')?.value || '';

			if (results.length === 0) {
				// Mostrar sugerencias de autocomplete si no hay resultados
				const suggestions = getAutocompleteSuggestions(query, selectedCategory);
				
				if (suggestions.length > 0) {
					const titleDiv = document.createElement('div');
					titleDiv.style.cssText = 'padding: 10px 15px; background: #f5f5f5; font-size: 11px; color: #999; font-weight: bold;';
					titleDiv.textContent = '👁️ Sugerencias:';
					searchResultsContainer.appendChild(titleDiv);

					suggestions.forEach(suggestion => {
						const suggestionDiv = document.createElement('div');
						suggestionDiv.className = 'search-suggestion-item';
						
						// Resaltar el término búsqueda en la sugerencia
						const highlighted = suggestion.value.replace(
							new RegExp(`(${query})`, 'gi'),
							'<span class="search-suggestion-highlight">$1</span>'
						);

						suggestionDiv.innerHTML = `
							<div>${highlighted}</div>
							<div style="font-size: 10px; color: #999; margin-top: 3px;">${suggestion.displayName}</div>
						`;

						suggestionDiv.addEventListener('click', () => {
							searchInput.value = suggestion.value;
							performGlobalSearch(suggestion.value, selectedCategory);
						});

						searchResultsContainer.appendChild(suggestionDiv);
					});
				} else {
					searchResultsContainer.innerHTML = '<div id="search-results-empty">No se encontraron resultados</div>';
				}
			} else {
				// Mostrar resultados encontrados
				// Limitar a 12 resultados (para dejar espacio a sugerencias)
				results.slice(0, 12).forEach((result, idx) => {
					const resultDiv = document.createElement('div');
					resultDiv.className = 'search-result-item';
					resultDiv.innerHTML = `
						<div class="search-result-layer">📍 ${result.displayName}</div>
						<div class="search-result-name">${result.name}</div>
						${result.detail ? `<div class="search-result-detail">${result.detail}</div>` : ''}
					`;

					resultDiv.addEventListener('click', () => {
						handleSearchResultClick(result);
					});

					searchResultsContainer.appendChild(resultDiv);
				});

				// Mostrar texto si hay más resultados
				if (results.length > 12) {
					const moreDiv = document.createElement('div');
					moreDiv.style.cssText = 'padding: 10px 15px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee;';
					moreDiv.textContent = `📍 ${results.length - 12} resultados más. Refina tu búsqueda.`;
					searchResultsContainer.appendChild(moreDiv);
				}
			}

			searchResultsContainer.classList.add('active');
		};

		// Manejar click en resultado
		const handleSearchResultClick = (result) => {
			// Cargar la capa si no está cargada
			if (!layers[result.varName]) {
				const geoJsonData = window[result.varName];
				addLayerToMap(result.varName, result.displayName, geoJsonData);
			}

			// Hacer visible la capa
			if (layers[result.varName] && !map.hasLayer(layers[result.varName].layer)) {
				map.addLayer(layers[result.varName].layer);
			}

			// Actualizar panel de capas para mostrar la capa recién agregada
			updateLayerList();
			updateReferences();
			styleLayerSelect.innerHTML = '<option value="">-- Seleccionar capa --</option>';
			Object.keys(layers).forEach(varName => {
				if (varName !== 'godoycruz') {
					const option = document.createElement('option');
					option.value = varName;
					option.textContent = layers[varName].displayName;
					styleLayerSelect.appendChild(option);
				}
			});

			// Navegar a la ubicación
			if (result.feature && result.feature.geometry) {
				let center;
				const geom = result.feature.geometry;
				
				if (geom.type === 'Point') {
					// Point: [lon, lat]
					center = L.latLng(geom.coordinates[1], geom.coordinates[0]);
				} else if (geom.type === 'MultiPoint' && geom.coordinates.length > 0) {
					// MultiPoint: [[lon, lat], ...]
					center = L.latLng(geom.coordinates[0][1], geom.coordinates[0][0]);
				} else if ((geom.type === 'LineString' || geom.type === 'MultiLineString') && geom.coordinates.length > 0) {
					// LineString o MultiLineString: usar primer punto
					const coords = geom.type === 'LineString' ? geom.coordinates[0] : geom.coordinates[0][0];
					if (coords && coords.length >= 2) {
						center = L.latLng(coords[1], coords[0]);
					}
				} else if (geom.type === 'Polygon' && geom.coordinates.length > 0 && geom.coordinates[0].length > 0) {
					// Polygon: calcular centroide
					center = calculateCentroid(geom.coordinates[0]);
				} else if (geom.type === 'MultiPolygon' && geom.coordinates.length > 0 && geom.coordinates[0].length > 0) {
					// MultiPolygon: calcular centroide del primer polígono
					center = calculateCentroid(geom.coordinates[0][0]);
				}

				if (center) {
					map.setView(center, 16);
					
					// Crear marcador temporal para destacar
					const tempMarker = L.circleMarker(center, {
						radius: 8,
						color: '#FFD700',
						weight: 2,
						opacity: 1,
						fillColor: '#FFA500',
						fillOpacity: 0.8
					}).addTo(map);

					// Mostrar popup
					const popupContent = `
						<div style="font-size: 12px;">
							<b>${result.name}</b><br>
							${result.detail ? `${result.detail}<br>` : ''}
							<small style="color: #999;">${result.displayName}</small>
						</div>
					`;
					tempMarker.bindPopup(popupContent).openPopup();

					// Remover marcador después de 3 segundos
					setTimeout(() => {
						map.removeLayer(tempMarker);
					}, 3000);
				}
			}

			// Limpiar búsqueda
			searchInput.value = '';
			searchResultsContainer.classList.remove('active');
			
			console.log(`👁️ Resultado seleccionado: ${result.name} (${result.displayName})`);
		};

		// ---------------------------------------------------------------
		// EVENT LISTENERS MEJORADOS
		// ---------------------------------------------------------------

		// Event listener para el input de búsqueda
		searchInput.addEventListener('input', (e) => {
			clearTimeout(searchTimeout);
			const query = e.target.value.trim();
			const selectedCategory = document.getElementById('search-category-filter')?.value || '';
			
			if (query.length < 2) {
				searchResultsContainer.classList.remove('active');
				return;
			}

			searchTimeout = setTimeout(() => {
				performGlobalSearch(query, selectedCategory);
			}, 300); // Debounce de 300ms
		});

		// Event listener para el filtro de categoría
		const categoryFilter = document.getElementById('search-category-filter');
		if (categoryFilter) {
			categoryFilter.addEventListener('change', (e) => {
				const query = searchInput.value.trim();
				if (query.length >= 2) {
					performGlobalSearch(query, e.target.value);
				}
			});
		}

		// Mostrar/cerrar resultados cuando el input recibe focus
		// DESHABILITADO: Causaba que se abra cuando se interactúa con otros elementos
		// searchInput.addEventListener('focus', () => {
		// 	// Solo mostrar resultados si hay algo escrito
		// 	if (searchInput.value.trim().length >= 2) {
		// 		searchResultsContainer.classList.add('active');
		// 	}
		// });

		// Cerrar resultados cuando se hace click fuera o en el panel de capas
		document.addEventListener('click', (e) => {
			const searchContainer = document.getElementById('global-search-container');
			const layerPanel = document.getElementById('layer-panel');
		
			// Si el click es en el buscador, mantener abierto
			if (e.target.closest('#global-search-container')) {
				return;
			}
		
			// Si el click es en el panel de capas, cerrar el buscador
			if (e.target.closest('#layer-panel')) {
				searchResultsContainer.classList.remove('active');
				return;
			}
		
			// Si el click está fuera de ambos, cerrar el buscador
			searchResultsContainer.classList.remove('active');
		});

		// Tecla Escape para cerrar búsqueda
		searchInput.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				searchInput.value = '';
				searchResultsContainer.classList.remove('active');
			}
		});

		console.log('? Búsqueda global mejorada: Autocomplete + Historial + Filtros por categoría');
	} else {
		console.warn('👁️ Elementos de búsqueda no encontrados en el HTML');
	}
});



