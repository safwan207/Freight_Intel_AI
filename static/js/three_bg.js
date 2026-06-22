// Three.js 3D Background - Interactive Holographic Globe & Cargo Routes

let scene, camera, renderer, globe, stars, routes = [];
let controls;
let isInteracting = false;
const container = document.getElementById('three-canvas-container');

// Configuration
const CONFIG = {
    globeColor: 0x06b6d4,     // Cyber Teal
    routeColor: 0x8b5cf6,     // Neon Purple
    starColor: 0xffffff,
    globeRadius: 3.5,
    numRoutes: 8
};

// Mouse movement variables for parallax
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

function initThree() {
    if (!container) return;

    // 1. Create Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070f, 0.05);

    // 2. Create Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    // 3. Create WebGL Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background to show CSS gradient
    container.appendChild(renderer.domElement);

    // 4. Create Holographic Globe (Particle Points)
    createGlobe();

    // 5. Create Star Field (Ambient Space particles)
    createStars();

    // 6. Create Glowing Logistics Routes
    createRoutes();

    // Initialize OrbitControls if available
    if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.minDistance = 4;
        controls.maxDistance = 15;
        
        controls.addEventListener('start', () => {
            isInteracting = true;
        });
        controls.addEventListener('end', () => {
            setTimeout(() => {
                isInteracting = false;
            }, 1000);
        });
    } else {
        document.addEventListener('mousemove', onDocumentMouseMove);
    }

    // Set initial position based on screen width
    adjustGlobePosition();

    // 7. Event Listeners
    window.addEventListener('resize', onWindowResize);

    // 8. Start Animation Loop
    animate();
}

function createGlobe() {
    // Holographic Wireframe sphere
    const sphereGeom = new THREE.SphereGeometry(CONFIG.globeRadius, 32, 32);
    
    // Create points (hologram dots)
    const pointsGeom = new THREE.BufferGeometry();
    const positions = sphereGeom.attributes.position.array;
    const colors = [];
    
    // Filter out some points randomly to make it look digital/sparse
    const particlePositions = [];
    for (let i = 0; i < positions.length; i += 3) {
        if (Math.random() > 0.15) {
            particlePositions.push(positions[i], positions[i+1], positions[i+2]);
        }
    }
    
    pointsGeom.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
    
    const pointsMat = new THREE.PointsMaterial({
        color: CONFIG.globeColor,
        size: 0.04,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending
    });
    
    globe = new THREE.Points(pointsGeom, pointsMat);
    scene.add(globe);

    // Add a faint wireframe overlay
    const wireframeGeom = new THREE.SphereGeometry(CONFIG.globeRadius * 0.99, 16, 16);
    const wireframeMat = new THREE.MeshBasicMaterial({
        color: CONFIG.globeColor,
        wireframe: true,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending
    });
    const globeWire = new THREE.Mesh(wireframeGeom, wireframeMat);
    globe.add(globeWire);
    
    // Add equator ring
    const ringGeom = new THREE.RingGeometry(CONFIG.globeRadius * 1.15, CONFIG.globeRadius * 1.16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
        color: CONFIG.routeColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.15
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2;
    globe.add(ring);
    
    // Rotate globe to face India (approx Lat 20, Lng 78) initially
    globe.rotation.y = -(78 * Math.PI / 180) + Math.PI/2;
    globe.rotation.x = (20 * Math.PI / 180);
}

function createStars() {
    const starGeom = new THREE.BufferGeometry();
    const starCount = 300;
    const starPositions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount * 3; i += 3) {
        // Place stars randomly far away
        const radius = 15 + Math.random() * 20;
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
        size: 0.03,
        transparent: true,
        opacity: 0.35
    });
    
    stars = new THREE.Points(starGeom, starMat);
    scene.add(stars);
}

// Convert Lat/Lng to Vector3 on our Globe sphere
function latLngToVector3(lat, lng, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.sin(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    return new THREE.Vector3(x, y, z);
}

function createRoutes() {
    // Indian cities coordinates
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

    // Generate random routes between points
    for (let i = 0; i < CONFIG.numRoutes; i++) {
        const startLoc = locations[Math.floor(Math.random() * locations.length)];
        let endLoc = locations[Math.floor(Math.random() * locations.length)];
        while (endLoc.name === startLoc.name) {
            endLoc = locations[Math.floor(Math.random() * locations.length)];
        }

        const startVec = latLngToVector3(startLoc.lat, startLoc.lng, radius);
        const endVec = latLngToVector3(endLoc.lat, endLoc.lng, radius);

        // Calculate control point for curved path (above sphere center)
        const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
        const dist = startVec.distanceTo(endVec);
        midPoint.normalize().multiplyScalar(radius + dist * 0.3); // Curve peak depends on distance

        // Build curve
        const curve = new THREE.QuadraticBezierCurve3(startVec, midPoint, endVec);
        const points = curve.getPoints(30);
        
        const pathGeom = new THREE.BufferGeometry().setFromPoints(points);
        const pathMat = new THREE.LineBasicMaterial({
            color: CONFIG.routeColor,
            transparent: true,
            opacity: 0.25,
            blending: THREE.AdditiveBlending
        });
        
        const line = new THREE.Line(pathGeom, pathMat);
        globe.add(line);

        // Add an animated comet particle moving along this path
        const cometGeom = new THREE.BufferGeometry();
        cometGeom.setAttribute('position', new THREE.Float32BufferAttribute([startVec.x, startVec.y, startVec.z], 3));
        
        const cometMat = new THREE.PointsMaterial({
            color: CONFIG.globeColor,
            size: 0.12,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const comet = new THREE.Points(cometGeom, cometMat);
        globe.add(comet);

        routes.push({
            curve: curve,
            comet: comet,
            progress: Math.random(), // Random initial offset
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
        globe.position.y = 1.6; // Shift globe up on mobile/tablet to leave space below
    } else {
        globe.position.x = 2.2;  // Shift globe right on desktop
        globe.position.y = 0;
    }
    
    if (controls) {
        controls.target.copy(globe.position);
        controls.update();
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (controls) {
        controls.update();
    } else {
        // Fallback parallax
        targetX = mouseX * 0.15;
        targetY = mouseY * 0.15;
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (-targetY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
    }

    // Slowly rotate the globe and routes
    if (globe && !isInteracting) {
        globe.rotation.y += 0.0012;
        globe.rotation.x += 0.0004;
    }

    // Slowly rotate star field opposite way
    if (stars) {
        stars.rotation.y -= 0.0002;
    }

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

// Load Three.js library and start
window.addEventListener('DOMContentLoaded', () => {
    // Check if THREE is defined (loaded from CDN in HTML)
    if (typeof THREE !== 'undefined') {
        initThree();
    } else {
        console.warn("Three.js not found. Static CSS gradient will act as fallback background.");
    }
});

// Expose function to cleanly draw specific multi-stop routing logic
window.drawLiveRoute = function(originName, hubName, destName) {
    if (!globe) return;
    
    // Clear old custom live routes
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
            color: 0xff0055, // Neon Pink
            linewidth: 2,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const line = new THREE.Line(pathGeom, pathMat);
        globe.add(line);
        window.liveRouteObjects.push(line);

        const cometGeom = new THREE.BufferGeometry();
        cometGeom.setAttribute('position', new THREE.Float32BufferAttribute([startVec.x, startVec.y, startVec.z], 3));
        const cometMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.25,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending
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
