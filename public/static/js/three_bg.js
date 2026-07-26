// Three.js 3D Background - Creative Interactive Periwinkle Globe & Animated Logistics Grid

let scene, camera, renderer, globe, stars, waveParticles, floatingCubes = [], routes = [];
let controls;
let isInteracting = false;
let clock = new THREE.Clock();
const container = document.getElementById('three-canvas-container');

// Configuration - Mild Light Periwinkle Palette
const CONFIG = {
    globeColor: 0x3D52A0,       // Deep Periwinkle Blue
    routeColor: 0x7091E6,       // Soft Cornflower Blue
    starColor: 0x8697C4,        // Steel Periwinkle
    waveColor: 0xADBBDA,        // Ice Lavender
    accentColor: 0x3D52A0,
    globeRadius: 3.4,
    numRoutes: 10
};

// Mouse movement variables for parallax
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

function initThree() {
    if (!container) return;

    // 1. Create Scene & Fog (Soft Lavender Mild Backdrop)
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xEDE8F5, 0.038);

    // 2. Create Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    // 3. Create WebGL Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xEDE8F5, 0); // Transparent to blend with CSS radial gradient
    container.appendChild(renderer.domElement);

    // 4. Create Globe (Particle Network + City Hub Nodes)
    createGlobe();

    // 5. Create Floating Dynamic Ambient Wave Particles
    createWaveParticles();

    // 6. Create Ambient Star / Floating Dust Field
    createStars();

    // 7. Create Floating Logistics Cubes / Geometry
    createFloatingCubes();

    // 8. Create Animated Shipping Routes & Comets
    createRoutes();

    // Initialize OrbitControls if available
    if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.minDistance = 4;
        controls.maxDistance = 16;
        
        controls.addEventListener('start', () => { isInteracting = true; });
        controls.addEventListener('end', () => {
            setTimeout(() => { isInteracting = false; }, 1000);
        });
    } else {
        document.addEventListener('mousemove', onDocumentMouseMove);
    }

    // Set initial position based on screen width
    adjustGlobePosition();

    // Event Listeners
    window.addEventListener('resize', onWindowResize);

    // Start Animation Loop
    animate();
}

function createGlobe() {
    // Globe Geometry
    const sphereGeom = new THREE.SphereGeometry(CONFIG.globeRadius, 36, 36);
    
    // Create particle dots for globe
    const positions = sphereGeom.attributes.position.array;
    const particlePositions = [];
    
    for (let i = 0; i < positions.length; i += 3) {
        if (Math.random() > 0.12) {
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

    // Inner wireframe sphere for depth
    const wireframeGeom = new THREE.SphereGeometry(CONFIG.globeRadius * 0.985, 20, 20);
    const wireframeMat = new THREE.MeshBasicMaterial({
        color: CONFIG.routeColor,
        wireframe: true,
        transparent: true,
        opacity: 0.12
    });
    const globeWire = new THREE.Mesh(wireframeGeom, wireframeMat);
    globe.add(globeWire);
    
    // Animated equator orbit ring
    const ringGeom = new THREE.RingGeometry(CONFIG.globeRadius * 1.15, CONFIG.globeRadius * 1.17, 64);
    const ringMat = new THREE.MeshBasicMaterial({
        color: CONFIG.routeColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2;
    globe.add(ring);

    // Second diagonal ring for creative depth
    const ring2Geom = new THREE.RingGeometry(CONFIG.globeRadius * 1.25, CONFIG.globeRadius * 1.26, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({
        color: CONFIG.globeColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2
    });
    const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 4;
    globe.add(ring2);

    // Add city hub node markers
    const locations = [
        { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
        { name: "Delhi", lat: 28.7041, lng: 77.1025 },
        { name: "Chennai", lat: 13.0827, lng: 80.2707 },
        { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
        { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
        { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
        { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
        { name: "Kochi", lat: 9.9312, lng: 76.2673 }
    ];

    locations.forEach(loc => {
        const vec = latLngToVector3(loc.lat, loc.lng, CONFIG.globeRadius);
        const nodeGeom = new THREE.SphereGeometry(0.08, 12, 12);
        const nodeMat = new THREE.MeshBasicMaterial({ color: 0x3D52A0 });
        const nodeMesh = new THREE.Mesh(nodeGeom, nodeMat);
        nodeMesh.position.copy(vec);
        globe.add(nodeMesh);
    });

    // Face India
    globe.rotation.y = -(78 * Math.PI / 180) + Math.PI/2;
    globe.rotation.x = (20 * Math.PI / 180);
}

// Create Creative Undulating Wave Particle Field in Background
function createWaveParticles() {
    const amountX = 60;
    const amountY = 40;
    const numParticles = amountX * amountY;

    const positions = new Float32Array(numParticles * 3);
    const scales = new Float32Array(numParticles);

    let i = 0, j = 0;
    for (let ix = 0; ix < amountX; ix++) {
        for (let iy = 0; iy < amountY; iy++) {
            positions[i] = (ix * 0.35) - (amountX * 0.35 / 2); // x
            positions[i + 1] = -3.5;                           // y (bottom)
            positions[i + 2] = (iy * 0.35) - (amountY * 0.35 / 2); // z

            scales[j] = 1;
            i += 3;
            j++;
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: CONFIG.waveColor,
        size: 0.05,
        transparent: true,
        opacity: 0.45
    });

    waveParticles = new THREE.Points(geometry, material);
    scene.add(waveParticles);
}

// Create Ambient Floating Dust / Light Stars
function createStars() {
    const starGeom = new THREE.BufferGeometry();
    const starCount = 250;
    const starPositions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount * 3; i += 3) {
        const radius = 12 + Math.random() * 18;
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        
        starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
        starPositions[i+1] = radius * Math.sin(phi) * Math.sin(theta);
        starPositions[i+2] = radius * Math.cos(phi);
    }
    
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    
    const starMat = new THREE.PointsMaterial({
        color: CONFIG.starColor,
        size: 0.045,
        transparent: true,
        opacity: 0.5
    });
    
    stars = new THREE.Points(starGeom, starMat);
    scene.add(stars);
}

// Create Creative Floating Wireframe Cargo Cubes
function createFloatingCubes() {
    const cubeGeom = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const cubeMat = new THREE.MeshBasicMaterial({
        color: 0x7091E6,
        wireframe: true,
        transparent: true,
        opacity: 0.4
    });

    for (let i = 0; i < 6; i++) {
        const mesh = new THREE.Mesh(cubeGeom, cubeMat);
        mesh.position.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6
        );
        mesh.userData = {
            rotSpeedX: 0.005 + Math.random() * 0.01,
            rotSpeedY: 0.005 + Math.random() * 0.01,
            initialY: mesh.position.y,
            floatSpeed: 0.8 + Math.random() * 0.5
        };
        scene.add(mesh);
        floatingCubes.push(mesh);
    }
}

// Convert Lat/Lng to Vector3
function latLngToVector3(lat, lng, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.sin(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    return new THREE.Vector3(x, y, z);
}

function createRoutes() {
    const locations = [
        { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
        { name: "Delhi", lat: 28.7041, lng: 77.1025 },
        { name: "Chennai", lat: 13.0827, lng: 80.2707 },
        { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
        { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
        { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
        { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
        { name: "Kochi", lat: 9.9312, lng: 76.2673 }
    ];

    const radius = CONFIG.globeRadius;

    for (let i = 0; i < CONFIG.numRoutes; i++) {
        const startLoc = locations[Math.floor(Math.random() * locations.length)];
        let endLoc = locations[Math.floor(Math.random() * locations.length)];
        while (endLoc.name === startLoc.name) {
            endLoc = locations[Math.floor(Math.random() * locations.length)];
        }

        const startVec = latLngToVector3(startLoc.lat, startLoc.lng, radius);
        const endVec = latLngToVector3(endLoc.lat, endLoc.lng, radius);

        const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
        const dist = startVec.distanceTo(endVec);
        midPoint.normalize().multiplyScalar(radius + dist * 0.32);

        const curve = new THREE.QuadraticBezierCurve3(startVec, midPoint, endVec);
        const points = curve.getPoints(32);
        
        const pathGeom = new THREE.BufferGeometry().setFromPoints(points);
        const pathMat = new THREE.LineBasicMaterial({
            color: CONFIG.routeColor,
            transparent: true,
            opacity: 0.45
        });
        
        const line = new THREE.Line(pathGeom, pathMat);
        globe.add(line);

        // Animated comet particle moving along route
        const cometGeom = new THREE.BufferGeometry();
        cometGeom.setAttribute('position', new THREE.Float32BufferAttribute([startVec.x, startVec.y, startVec.z], 3));
        
        const cometMat = new THREE.PointsMaterial({
            color: 0x3D52A0,
            size: 0.14,
            transparent: true,
            opacity: 0.95
        });
        
        const comet = new THREE.Points(cometGeom, cometMat);
        globe.add(comet);

        routes.push({
            curve: curve,
            comet: comet,
            progress: Math.random(),
            speed: 0.003 + Math.random() * 0.004
        });
    }
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) / 100;
    mouseY = (event.clientY - windowHalfY) / 100;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    adjustGlobePosition();
}

function adjustGlobePosition() {
    if (!globe) return;
    if (window.innerWidth < 992) {
        globe.position.x = 0;
        globe.position.y = 1.6;
    } else {
        globe.position.x = 2.2;
        globe.position.y = 0;
    }
    
    if (controls) {
        controls.target.copy(globe.position);
        controls.update();
    }
}

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    if (controls) {
        controls.update();
    } else {
        targetX = mouseX * 0.15;
        targetY = mouseY * 0.15;
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (-targetY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
    }

    // Slowly rotate globe
    if (globe && !isInteracting) {
        globe.rotation.y += 0.0015;
        globe.rotation.x += 0.0003;
    }

    // Rotate star field
    if (stars) {
        stars.rotation.y -= 0.0003;
    }

    // Animate Undulating Wave Particle Field
    if (waveParticles) {
        const positions = waveParticles.geometry.attributes.position.array;
        let i = 0;
        const amountX = 60;
        const amountY = 40;

        for (let ix = 0; ix < amountX; ix++) {
            for (let iy = 0; iy < amountY; iy++) {
                positions[i + 1] = -3.5 + (Math.sin((ix + elapsedTime * 2) * 0.2) * 0.25) + (Math.sin((iy + elapsedTime * 2) * 0.3) * 0.25);
                i += 3;
            }
        }
        waveParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Animate Floating Wireframe Cubes
    floatingCubes.forEach(cube => {
        cube.rotation.x += cube.userData.rotSpeedX;
        cube.rotation.y += cube.userData.rotSpeedY;
        cube.position.y = cube.userData.initialY + Math.sin(elapsedTime * cube.userData.floatSpeed) * 0.3;
    });

    // Animate route comets
    routes.forEach(route => {
        route.progress += route.speed;
        if (route.progress > 1) {
            route.progress = 0;
        }

        const point = route.curve.getPointAt(route.progress);
        route.comet.geometry.setAttribute(
            'position', 
            new THREE.Float32BufferAttribute([point.x, point.y, point.z], 3)
        );
        route.comet.geometry.attributes.position.needsUpdate = true;
    });

    // Animate custom live routes
    if (window.liveRouteComets) {
        window.liveRouteComets.forEach(route => {
            route.progress += route.speed;
            if (route.progress > 1) {
                route.progress = 0;
            }
            const point = route.curve.getPointAt(route.progress);
            route.comet.geometry.setAttribute(
                'position', 
                new THREE.Float32BufferAttribute([point.x, point.y, point.z], 3)
            );
            route.comet.geometry.attributes.position.needsUpdate = true;
        });
    }

    renderer.render(scene, camera);
}

// Start Three.js initialization when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE !== 'undefined') {
        initThree();
    }
});

// Custom segment drawing helper
window.drawLiveRoute = function(originName, hubName, destName) {
    if (!globe) return;
    
    if (window.liveRouteObjects) {
        window.liveRouteObjects.forEach(obj => {
            globe.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
    }
    window.liveRouteObjects = [];
    window.liveRouteComets = []; 

    const locs = {
        "Mumbai": { lat: 19.0760, lng: 72.8777 },
        "Delhi": { lat: 28.7041, lng: 77.1025 },
        "Chennai": { lat: 13.0827, lng: 80.2707 },
        "Kolkata": { lat: 22.5726, lng: 88.3639 },
        "Bengaluru": { lat: 12.9716, lng: 77.5946 },
        "Hyderabad": { lat: 17.3850, lng: 78.4867 },
        "Ahmedabad": { lat: 23.0225, lng: 72.5714 },
        "Kochi": { lat: 9.9312, lng: 76.2673 }
    };

    function drawSegment(startLoc, endLoc) {
        if (!startLoc || !endLoc) return;
        const radius = CONFIG.globeRadius;
        const startVec = latLngToVector3(startLoc.lat, startLoc.lng, radius);
        const endVec = latLngToVector3(endLoc.lat, endLoc.lng, radius);

        const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
        const dist = startVec.distanceTo(endVec);
        midPoint.normalize().multiplyScalar(radius + dist * 0.4); 

        const curve = new THREE.QuadraticBezierCurve3(startVec, midPoint, endVec);
        const points = curve.getPoints(40);
        
        const pathGeom = new THREE.BufferGeometry().setFromPoints(points);
        const pathMat = new THREE.LineBasicMaterial({
            color: 0x3D52A0,
            linewidth: 2,
            transparent: true,
            opacity: 0.85
        });
        
        const line = new THREE.Line(pathGeom, pathMat);
        globe.add(line);
        window.liveRouteObjects.push(line);

        const cometGeom = new THREE.BufferGeometry();
        cometGeom.setAttribute('position', new THREE.Float32BufferAttribute([startVec.x, startVec.y, startVec.z], 3));
        const cometMat = new THREE.PointsMaterial({
            color: 0x7091E6,
            size: 0.22,
            transparent: true,
            opacity: 1.0
        });
        
        const comet = new THREE.Points(cometGeom, cometMat);
        globe.add(comet);
        window.liveRouteObjects.push(comet);

        window.liveRouteComets.push({
            curve: curve,
            comet: comet,
            progress: 0,
            speed: 0.008
        });
    }

    if (hubName && locs[hubName]) {
        drawSegment(locs[originName], locs[hubName]);
        drawSegment(locs[hubName], locs[destName]);
    } else {
        drawSegment(locs[originName], locs[destName]);
    }
};
