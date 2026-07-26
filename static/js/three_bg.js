// Three.js 3D Background - Lightweight, Ultra-Fast 60FPS Live Particle Globe
let scene, camera, renderer, globe, stars;
let isInteracting = false;
const container = document.getElementById('three-canvas-container');

const CONFIG = {
    globeColor: 0x4f46e5,     // Indigo / Periwinkle
    starColor: 0x3b82f6,      // Sky Blue
    globeRadius: 3.5
};

function initThree() {
    if (!container) return;

    // 1. Create Scene
    scene = new THREE.Scene();

    // 2. Create Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    // 3. Create WebGL Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // 4. Create Lightweight 3D Globe & Particles
    createGlobe();
    createStars();

    adjustGlobePosition();
    window.addEventListener('resize', onWindowResize);
    animate();
}

function createGlobe() {
    const sphereGeom = new THREE.SphereGeometry(CONFIG.globeRadius, 24, 24);
    const particlePositions = [];
    const positions = sphereGeom.attributes.position.array;

    for (let i = 0; i < positions.length; i += 3) {
        if (Math.random() > 0.2) {
            particlePositions.push(positions[i], positions[i+1], positions[i+2]);
        }
    }

    const pointsGeom = new THREE.BufferGeometry();
    pointsGeom.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));

    const pointsMat = new THREE.PointsMaterial({
        color: CONFIG.globeColor,
        size: 0.05,
        transparent: true,
        opacity: 0.7
    });

    globe = new THREE.Points(pointsGeom, pointsMat);
    scene.add(globe);

    // Wireframe inner sphere
    const wireGeom = new THREE.SphereGeometry(CONFIG.globeRadius * 0.98, 16, 16);
    const wireMat = new THREE.MeshBasicMaterial({
        color: 0x818cf8,
        wireframe: true,
        transparent: true,
        opacity: 0.2
    });
    const wireMesh = new THREE.Mesh(wireGeom, wireMat);
    globe.add(wireMesh);
}

function createStars() {
    const starsGeom = new THREE.BufferGeometry();
    const starCount = 150;
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
        starPositions[i] = (Math.random() - 0.5) * 30;
        starPositions[i+1] = (Math.random() - 0.5) * 30;
        starPositions[i+2] = (Math.random() - 0.5) * 30;
    }

    starsGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({
        color: CONFIG.starColor,
        size: 0.04,
        transparent: true,
        opacity: 0.5
    });

    stars = new THREE.Points(starsGeom, starsMat);
    scene.add(stars);
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

    if (globe) {
        globe.rotation.y += 0.0015;
    }
    if (stars) {
        stars.rotation.y += 0.0003;
    }

    renderer.render(scene, camera);
}

document.addEventListener('DOMContentLoaded', initThree);
