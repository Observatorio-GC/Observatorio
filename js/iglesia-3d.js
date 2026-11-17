export const CHURCH_ORIGIN = [-68.84473745276793, -32.926130140639486];

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

export function createChurchModelLayer(model) {
	const origin = maplibregl.MercatorCoordinate.fromLngLat(CHURCH_ORIGIN, 0);
	const scale = origin.meterInMercatorCoordinateUnits();
	let camera, scene, renderer, transform, map;
	let rendered = false;

	return {
		id: 'church-model',
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
				.multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
			renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl });
			renderer.autoClear = false;
		},
		render(gl, matrix) {
			camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix).multiply(transform);
			renderer.resetGLState();
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
