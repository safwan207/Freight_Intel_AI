// Three.js 3D Background - Gorgeous Contrast (Electric Lime & Dark Charcoal)
let scene, camera, renderer, globe, stars, routes = [];
let controls;
let isInteracting = false;
const container = document.getElementById('three-canvas-container');

// Theme 27 Palette
const CONFIG = {
    globeColor: 0x86C232,     // Electric Lime Green
    routeColor: 0x61892F,     // Forest Olive Green
    starColor: 0x86C232,      // Lime Star Particles
    globeRadius: 3.5
};

function initThree() {
    if (!container) return;

    // 1. Create Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x222629, 0.04);

    // 2. Create Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    // 3. Create WebGL Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x222629, 1);
    container.appendChild(renderer.domElement);

    // 4. Create Globe & Routes
    createGlobe();
    createStars();
    createRoutes();

    // 5. Initialize OrbitControls
    if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.minDistance = 4;
        controls.maxDistance = 15;
        controls.addEventListener('start', () => { isInteracting = true; });
        controls.addEventListener('end', () => { setTimeout(() => { isInteracting = false; }, 1000); });
    }

    adjustGlobePosition();
    window.addEventListener('resize', onWindowResize);
    animate();
}

function createGlobe() {
    const sphereGeom = new THREE.SphereGeometry(CONFIG.globeRadius, 36, 36);
    const particlePositions = [];
    const positions = sphereGeom.attributes.position.array;

    for (let i = 0; i < positions.length; i += 3) {
        if (Math.random() > 0.15) {
            particlePositions.push(positions[i], positions[i+1], positions[i+2]);
        }
    }

    const pointsGeom = new THREE.BufferGeometry();
    pointsGeom.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));

    const pointsMat = new THREE.PointsMaterial({
        color: CONFIG.globeColor,
        size: 0.045,
        transparent: true,
        opacity: 0.75
    });

    globe = new THREE.Points(pointsGeom, pointsMat);
    scene.add(globe);

    // Inner wireframe sphere
    const wireGeom = new THREE.SphereGeometry(CONFIG.globeRadius * 0.98, 20, 20);
    const wireMat = new THREE.MeshBasicMaterial({
        color: 0x61892F,
        wireframe: true,
        transparent: true,
        opacity: 0.25
    });
    const wireMesh = new THREE.Mesh(wireGeom, wireMat);
    globe.add(wireMesh);
}

function createStars() {
    const starsGeom = new THREE.BufferGeometry();
    const starCount = 350;
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
        starPositions[i] = (Math.random() - 0.5) * 40;
        starPositions[i+1] = (Math.random() - 0.5) * 40;
        starPositions[i+2] = (Math.random() - 0.5) * 40;
    }

    starsGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({
        color: CONFIG.starColor,
        size: 0.04,
        transparent: true,
        opacity: 0.4
    });

    stars = new THREE.Points(starsGeom, starsMat);
    scene.add(stars);
}

function createRoutes() {
    // Demo routes between Indian Cities
    const cityCoords = [
        { lat: 19.076, lng: 72.877 }, // Mumbai
        { lat: 28.704, lng: 77.102 }, // Delhi
        { lat: 13.082, lng: 80.270 }, // Chennai
        { lat: 22.572, lng: 88.363 }, // Kolkata
        { lat: 12.971, lng: 77.594 }  // Bengaluru
    ];

    for (let i = 0; i < cityCoords.length - 1; i++) {
        addRouteArc(cityCoords[i], cityCoords[i+1]);
    }
}

function addRouteArc(coord1, coord2) {
    const p1 = latLngToVector3(coord1.lat, coord1.lng, CONFIG.globeRadius);
    const p2 = latLngToVector3(coord2.lat, coord2.lng, CONFIG.globeRadius);

    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const distance = p1.distanceTo(p2);
    mid.setLength(CONFIG.globeRadius + distance * 0.25);

    const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
    const points = curve.getPoints(40);
    const geom = new THREE.BufferGeometry().setFromPoints(points);

    const mat = new THREE.LineBasicMaterial({
        color: CONFIG.routeColor,
        transparent: true,
        opacity: 0.6,
        linewidth: 1.5
    });

    const line = new THREE.Line(geom, mat);
    globe.add(line);
}

function latLngToVector3(lat, lng, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));

    return new THREE.Vector3(x, y, z);
}

function adjustGlobePosition() {
    if (!globe) return;
    if (window.innerWidth >= 992) {
        globe.position.x = 2.2;
    } else {
        globe.position.x = 0;
    }
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    adjustGlobePosition();
}

function animate() {
    requestAnimationFrame(animate);

    if (globe && !isInteracting) {
        globe.rotation.y += 0.0015;
    }
    if (stars) {
        stars.rotation.y += 0.0003;
    }
    if (controls) {
        controls.update();
    }

    renderer.render(scene, camera);
}

document.addEventListener('DOMContentLoaded', initThree);
