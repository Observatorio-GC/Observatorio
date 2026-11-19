export const CHURCH_ORIGIN = [-68.84477439790456, -32.92626924769913];
export const MODELS_3D = [
	{
		id: 'iglesia', name: 'Basílica San Vicente Ferrer', origin: CHURCH_ORIGIN,
		footprints: [[-68.84465969854395, -32.92629513800178], [-68.84486357088808, -32.926363493627754]], rotation: [0, 0, -12],
		description: 'Referente espiritual e hito visual del centro cívico; su aguja central domina el perfil urbano alrededor de la plaza.',
		status: 'Patrimonio Cultural Provincial', inauguration: '1912', style: 'Neogótico', location: 'Lavalle 60'
	},
	{
		id: 'cau', name: 'Centro de Atención Unificada (CAU)', origin: [-68.84367725297659, -32.925660547826126],
		footprints: [[-68.8430856551298, -32.9260918349403], [-68.84367474785769, -32.92568145276998]], rotation: [0, 0, -15],
		description: 'Atención ciudadana y gestión administrativa municipal.',
		status: 'Patrimonio Cívico Municipal', inauguration: 'Mediados del siglo XX', style: 'Modernismo institucional', location: 'Perito Moreno 72'
	},
	{
		id: 'correo', name: 'Edificio Correo Argentino', origin: [-68.84358102209616, -32.92545370951709],
		footprints: [[-68.84367163188519, -32.925452021220835], [-68.8433555406588, -32.925379814224996]], rotation: [0, 0, -12],
		description: 'Pieza clave del conjunto cívico que consolida el borde institucional de la plaza con sobriedad formal y escala urbana.',
		status: 'Patrimonio Arquitectónico Institucional', inauguration: 'Década de 1940', style: 'Racionalismo institucional', location: 'Perito Moreno 50'
	},
	{
		id: 'escuela-rawson', name: 'Escuela Dr. Guillermo Rawson / Juliana Aguirre', origin: [-68.84276871883068, -32.926061107692355], rotation: [0, 0, -15],
		description: 'Representante de la arquitectura escolar fundacional de Mendoza, concebida como edificio-monumento para la educación pública.',
		status: 'Patrimonio Arquitectónico Educativo', inauguration: 'Principios del siglo XX (Plan de Escuelas Monumentales)', style: 'Eclecticismo academicista escolar', location: 'Azopardo 76'
	},
	{
		id: 'hcd', name: 'Honorable Concejo Deliberante (HCD)', origin: [-68.84326721582934, -32.92508485403507], footprint: [-68.84322273561544, -32.92510434277381], rotation: [0, 0, 0],
		description: 'Recinto deliberativo donde se sancionan las ordenanzas del departamento; articula el frente cívico sobre calle Perito Moreno.',
		status: 'Sede Legislativa Departamental', inauguration: 'Década de 1930 / Remodelaciones institucionales', style: 'Neocolonial / Institucional mendocino', location: 'Rivadavia 448'
	},
	{
		id: 'arizu', name: 'Ex Bodega Arizu', origin: [-68.8436068820374, -32.90925508925422],
		footprints: [
			[-68.84429148141655, -32.91008644397749], [-68.8438154366564, -32.90982283798059],
			[-68.84342288061615, -32.91007077642853], [-68.84380263593589, -32.90974500142311],
			[-68.84379210227287, -32.909666759689415], [-68.84378093006681, -32.909588260241584],
			[-68.84376975786076, -32.90951064281003], [-68.84375976167637, -32.90943243736762],
			[-68.84375133382719, -32.90935379091708], [-68.84415133233912, -32.909490740480514],
			[-68.84347955016142, -32.908341168253], [-68.8429727675019, -32.908396288757146],
			[-68.84296857608716, -32.90840220377875], [-68.84371771890093, -32.908795768625005],
			[-68.8437108097735, -32.908716225457965], [-68.8437031656325, -32.908637446704944],
			[-68.84352657265369, -32.908573822094], [-68.84351329463378, -32.9084957471165],
			[-68.8434972584755, -32.90841647039183], [-68.84425097989376, -32.9099126847066],
			[-68.84423337448155, -32.909830796846265], [-68.84421495504182, -32.9097512757296],
			[-68.84419285869679, -32.909670457313986], [-68.84417254292208, -32.90958897371112],
			[-68.84399661007721, -32.90891032605672], [-68.84397435386673, -32.90882973579534],
			[-68.84395497155924, -32.90875435618004], [-68.84393702987832, -32.908675959634124],
			[-68.84391728006406, -32.90859489866404], [-68.84389244953942, -32.9085145965392],
			[-68.84373505924901, -32.90922668686038], [-68.8430204083244, -32.90934979703725],
			[-68.84431419113035, -32.91014681358094]
		], rotation: [0, 0, 0],
		description: 'Emblema del desarrollo agroindustrial mendocino; conserva sus naves históricas, cavas subterráneas y fachadas.',
		status: 'Monumento Histórico Nacional', inauguration: '1888 (fundación) / Década de 1920 (nave principal)', style: 'Arquitectura industrial vitivinícola', location: 'Av. San Martín 1515'
	},
	{
		id: 'cristoforo', name: 'Espacio Patrimonial y Artístico Cristoforo Colombo', origin: [-68.84276141815924, -32.92205623377654],
		footprints: [
			[-68.8432342594102, -32.92213649405587], [-68.84341099076906, -32.92214331609658],
			[-68.84287292629556, -32.92203452879823], [-68.84320151872792, -32.92197617454463],
			[-68.84398897779275, -32.92205622286504], [-68.84336673544051, -32.92194252276624]
		], rotation: [0, 0, 78],
		description: 'Centro cultural y sala de exposiciones, antigua Sociedad Italiana de Socorros Mutuos.',
		status: 'Bien del Patrimonio Cultural Municipal', inauguration: '1929 (antigua sede de la Sociedad Italiana)', style: 'Eclecticismo academicista', location: 'Antonio Tomba 246'
	},
	{
		id: 'comisaria', name: 'Comisaría 7ª de Godoy Cruz', origin: [-68.84500049333491, -32.92604288819049],
		footprints: [
			[-68.84519894665837, -32.92599368075866], [-68.84521022687879, -32.92608663676419],
			[-68.84526458596763, -32.92627187406079], [-68.84514686345558, -32.926099200144776],
			[-68.8451913724512, -32.926296988038686], [-68.84513660149413, -32.9263603810099]
		], rotation: [0, 0, -2],
		description: 'Parte del anillo fundacional de equipamiento público que estructuró el casco céntrico del departamento.',
		status: 'Edificio Institucional Histórico', inauguration: 'Primera mitad del siglo XX', style: 'Academicismo institucional sobrio', location: 'Lavalle y Colón'
	},
	{
		id: 'cine-plaza', name: 'Cine Teatro Plaza', origin: [-68.84506730525109, -32.924947766125776],
		footprint: [-68.84531940508435, -32.92492414153182], rotation: [0, 0, -2],
		description: 'Principal escenario cultural de Godoy Cruz; mantiene intacta su emblemática marquesina, foyer y sala histórica.',
		status: 'Bien del Patrimonio Cultural Municipal', inauguration: '1946', style: 'Art Déco', location: 'Colón 27'
	}
];

export function containsPoint(geometry, point) {
	function inRing(ring) {
		let inside = false;
		for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
			const [x, y] = ring[i];
			const [previousX, previousY] = ring[j];
			if ((y > point[1]) !== (previousY > point[1]) &&
				point[0] < (previousX - x) * (point[1] - y) / (previousY - y) + x) {
				inside = !inside;
			}
		}
		return inside;
	}

	function inPolygon(polygon) {
		return polygon.length > 0 && inRing(polygon[0]) && !polygon.slice(1).some(inRing);
	}

	if (!geometry) return false;
	if (geometry.type === 'Polygon') return inPolygon(geometry.coordinates);
	if (geometry.type === 'MultiPolygon') return geometry.coordinates.some(inPolygon);
	return false;
}

export function coveredByLoadedModel(geometry, modelLayers, bbox) {
	return MODELS_3D.some((model) =>
		modelLayers.has(model.id) &&
		(model.footprints || [model.footprint || model.origin]).some((point) =>
			(!bbox || (point[0] >= bbox[0] && point[0] <= bbox[2] &&
				point[1] >= bbox[1] && point[1] <= bbox[3])) && containsPoint(geometry, point)));
}

export function withoutCoveredPolygons(feature, modelLayers) {
	if (feature.geometry.type !== 'MultiPolygon') {
		return coveredByLoadedModel(feature.geometry, modelLayers, feature.bbox) ? null : feature;
	}
	const polygons = feature.geometry.coordinates.filter((polygon) =>
		!coveredByLoadedModel({ type: 'Polygon', coordinates: polygon }, modelLayers, feature.bbox));
	if (polygons.length === feature.geometry.coordinates.length) return feature;
	if (!polygons.length) return null;
	return { ...feature, geometry: { ...feature.geometry, coordinates: polygons } };
}

export function createChurchModelLayer(model, config = MODELS_3D[0]) {
	const origin = maplibregl.MercatorCoordinate.fromLngLat(config.origin, 0);
	const scale = origin.meterInMercatorCoordinateUnits();
	let camera, scene, renderer, transform, map;
	let rendered = false;

	return {
		id: `model-${config.id}`,
		type: 'custom',
		renderingMode: '3d',
		onAdd(mapInstance, gl) {
			map = mapInstance;
			camera = new THREE.Camera();
			scene = new THREE.Scene();
			scene.add(model);
			scene.add(new THREE.AmbientLight(0xffffff, 0.8));
			const light = new THREE.DirectionalLight(0xffffff, 0.8);
			light.position.set(0, 100, 100);
			scene.add(light);
			transform = new THREE.Matrix4()
				.makeTranslation(origin.x, origin.y, origin.z)
				.scale(new THREE.Vector3(scale, -scale, scale))
				.multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(
					...config.rotation.map((degrees) => degrees * Math.PI / 180), 'XYZ')))
				.multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
			renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl });
			renderer.autoClear = false;
		},
		render(gl, matrix) {
			camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix).multiply(transform);
			renderer.state.reset();
			renderer.render(scene, camera);
			rendered = true;
		},
		pick(point) {
			if (!rendered) return false;
			const canvas = map.getCanvas();
			const x = point.x / canvas.clientWidth * 2 - 1;
			const y = 1 - point.y / canvas.clientHeight * 2;
			const inverse = new THREE.Matrix4().getInverse(camera.projectionMatrix);
			const near = new THREE.Vector3(x, y, -1).applyMatrix4(inverse);
			const far = new THREE.Vector3(x, y, 1).applyMatrix4(inverse);
			const raycaster = new THREE.Raycaster(near, far.sub(near).normalize());
			model.updateMatrixWorld(true);
			return raycaster.intersectObject(model, true).length > 0;
		},
		onRemove() {
			if (renderer) renderer.dispose();
		}
	};
}
