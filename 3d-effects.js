/**
 * 3d-effects.js
 * Implements interactive 3D particle constellation background,
 * hero 3D wireframe and particle orbit scene, and responsive 3D card tilt.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.warn('Three.js is not loaded. Background 3D and Hero 3D will be disabled.');
        initCardTilt(); // Fallback: CSS 3D Tilt still works
        return;
    }

    // 2. Initialize 3D Effects
    initThreeBackground();
    initHero3D();
    initCardTilt();

    // 3. Listen for theme toggles to dynamically update 3D colors
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        const originalToggle = window.toggleTheme;
        if (typeof originalToggle === 'function') {
            window.toggleTheme = function() {
                originalToggle();
                // Broadcast an event to update colors
                window.dispatchEvent(new CustomEvent('themeChanged'));
            };
        }
    }
});

// Helper: Get colors matching current dark/light mode
function getThemeColors() {
    const isLight = document.body.classList.contains('light-mode');
    return {
        particle: isLight ? '#2563eb' : '#60a5fa',      // blue
        particleAlt: isLight ? '#7c3aed' : '#c084fc',   // purple
        line: isLight ? '#93c5fd' : '#818cf8',          // light blue/indigo
        lineOpacity: isLight ? 0.12 : 0.07,
        heroMesh: isLight ? '#2563eb' : '#60a5fa',
        heroMeshAlt: isLight ? '#7c3aed' : '#c084fc',
        heroParticles: isLight ? '#06b6d4' : '#67e8f9'   // cyan
    };
}

// Helper: Create a glowing circular gradient texture for particles
function createCircleTexture(colorStr) {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.4, colorStr);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    return new THREE.CanvasTexture(canvas);
}


/* =========================================================================
   1. Interactive 3D Particle Constellation Background
   ========================================================================= */
function initThreeBackground() {
    // Check if background canvas already exists
    if (document.getElementById('3d-bg-canvas')) return;

    // Create canvas dynamically
    const canvas = document.createElement('canvas');
    canvas.id = '3d-bg-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-2';
    canvas.style.pointerEvents = 'none';
    document.body.prepend(canvas);

    let colors = getThemeColors();

    // Scene & Camera setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Particle field properties
    const particleCount = 100;
    const boxSize = 800; // Size of bounding box
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleData = [];

    // Initialize particle positions and velocities
    for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * boxSize - boxSize / 2;
        const y = Math.random() * boxSize - boxSize / 2;
        const z = Math.random() * boxSize - boxSize / 2;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        particleData.push({
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.4,
                (Math.random() - 0.5) * 0.4,
                (Math.random() - 0.5) * 0.4
            ),
            numConnections: 0
        });
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle material
    let particleTexture = createCircleTexture(colors.particle);
    let particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 5,
        map: particleTexture,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
    });

    const pointCloud = new THREE.Points(particles, particleMaterial);
    scene.add(pointCloud);

    // Constellation lines connection setup
    const maxConnections = 150;
    const connectionDist = 120;
    const linePositions = new Float32Array(maxConnections * 2 * 3);
    const lineColors = new Float32Array(maxConnections * 2 * 3);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: colors.lineOpacity,
        depthWrite: false
    });

    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineMesh);

    // Interactive state
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    let scrollY = 0;
    let targetScrollY = 0;

    window.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener('scroll', () => {
        targetScrollY = window.scrollY;
    });

    // Theme changed event handler
    window.addEventListener('themeChanged', () => {
        colors = getThemeColors();
        // Update particle textures and colors
        pointCloud.material.map = createCircleTexture(colors.particle);
        pointCloud.material.needsUpdate = true;
        lineMesh.material.opacity = colors.lineOpacity;
        lineMesh.material.needsUpdate = true;
    });

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Main animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Interpolate mouse coordinates and scroll for smooth parallax
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;
        scrollY += (targetScrollY - scrollY) * 0.08;

        // Subtle camera camera parallax
        camera.position.x = mouseX * 100;
        camera.position.y = -mouseY * 100;
        // Deep camera movement based on page scroll
        camera.position.z = 400 + scrollY * 0.25;
        camera.lookAt(scene.position);

        const particlePositions = particles.attributes.position.array;
        let vertexIdx = 0;
        let colorIdx = 0;
        let numConnected = 0;

        // Reset connectivity count
        for (let i = 0; i < particleCount; i++) {
            particleData[i].numConnections = 0;
        }

        // Update positions and calculate distances
        for (let i = 0; i < particleCount; i++) {
            // Add velocity
            particlePositions[i * 3] += particleData[i].velocity.x;
            particlePositions[i * 3 + 1] += particleData[i].velocity.y;
            particlePositions[i * 3 + 2] += particleData[i].velocity.z;

            // Bounding box collision / wrap-around
            const limit = boxSize / 2;
            if (Math.abs(particlePositions[i * 3]) > limit) particleData[i].velocity.x *= -1;
            if (Math.abs(particlePositions[i * 3 + 1]) > limit) particleData[i].velocity.y *= -1;
            if (Math.abs(particlePositions[i * 3 + 2]) > limit) particleData[i].velocity.z *= -1;

            // Constellation line mapping
            for (let j = i + 1; j < particleCount; j++) {
                if (numConnected >= maxConnections) break;

                const dx = particlePositions[i * 3] - particlePositions[j * 3];
                const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
                const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < connectionDist) {
                    // Node connections
                    particleData[i].numConnections++;
                    particleData[j].numConnections++;

                    // Map coordinates
                    linePositions[vertexIdx++] = particlePositions[i * 3];
                    linePositions[vertexIdx++] = particlePositions[i * 3 + 1];
                    linePositions[vertexIdx++] = particlePositions[i * 3 + 2];

                    linePositions[vertexIdx++] = particlePositions[j * 3];
                    linePositions[vertexIdx++] = particlePositions[j * 3 + 1];
                    linePositions[vertexIdx++] = particlePositions[j * 3 + 2];

                    // Map line gradient fade based on distance
                    const alpha = 1.0 - (dist / connectionDist);
                    const lineCol = new THREE.Color(colors.line);
                    
                    lineColors[colorIdx++] = lineCol.r * alpha;
                    lineColors[colorIdx++] = lineCol.g * alpha;
                    lineColors[colorIdx++] = lineCol.b * alpha;

                    lineColors[colorIdx++] = lineCol.r * alpha;
                    lineColors[colorIdx++] = lineCol.g * alpha;
                    lineColors[colorIdx++] = lineCol.b * alpha;

                    numConnected++;
                }
            }
        }

        // Draw connections
        lineMesh.geometry.setDrawRange(0, numConnected * 2);
        lineGeometry.attributes.position.needsUpdate = true;
        lineGeometry.attributes.color.needsUpdate = true;
        particles.attributes.position.needsUpdate = true;

        // Slow rotation of the cloud
        pointCloud.rotation.y += 0.0008;
        lineMesh.rotation.y += 0.0008;

        renderer.render(scene, camera);
    }

    animate();
}


/* =========================================================================
   2. Interactive 3D Hero Scene (Torus Knot + Orbit Particle Swarm)
   ========================================================================= */
function initHero3D() {
    const canvas = document.getElementById('hero-3d-canvas');
    if (!canvas) return;

    let colors = getThemeColors();

    const parent = canvas.parentElement;
    const width = parent.clientWidth || 340;
    const height = parent.clientHeight || 340;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    // Torus Knot central mesh
    const geometry = new THREE.TorusKnotGeometry(2.4, 0.7, 100, 10, 2, 3);
    const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colors.heroMesh),
        wireframe: true,
        transparent: true,
        opacity: 0.25
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    // Outer orbiting ring
    const ringGeom = new THREE.TorusGeometry(4.8, 0.08, 8, 80);
    const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colors.heroMeshAlt),
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    const outerRing = new THREE.Mesh(ringGeom, ringMat);
    outerRing.rotation.x = Math.PI / 3;
    scene.add(outerRing);

    // Orbital particles
    const orbitCount = 30;
    const orbitalParticles = [];
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(orbitCount * 3);
    const particleTexture = createCircleTexture(colors.heroParticles);

    for (let i = 0; i < orbitCount; i++) {
        // Orbit parameters
        const radius = 4.2 + Math.random() * 1.5;
        const angle = Math.random() * Math.PI * 2;
        const speed = (0.005 + Math.random() * 0.01) * (Math.random() > 0.5 ? 1 : -1);
        const tilt = (Math.random() - 0.5) * 1.2; // Angle tilt relative to plane

        orbitalParticles.push({ radius, angle, speed, tilt, index: i });

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * Math.cos(tilt);
        const z = Math.sin(angle) * radius * Math.sin(tilt);

        particlePositions[i * 3] = x;
        particlePositions[i * 3 + 1] = y;
        particlePositions[i * 3 + 2] = z;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const orbitalPointsMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.45,
        map: particleTexture,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
    });

    const orbitPoints = new THREE.Points(particleGeom, orbitalPointsMat);
    orbitGroup.add(orbitPoints);

    // Interactive mouse trackers on the container
    let isHovered = false;
    let hoverX = 0, hoverY = 0;
    let targetRotationX = 0, targetRotationY = 0;

    parent.addEventListener('mouseenter', () => {
        isHovered = true;
        // Visual boost: scale up image slightly & make torus brighter
        const img = parent.querySelector('.profile-img');
        if (img) img.style.transform = 'scale(1.05)';
        material.opacity = 0.65;
        ringMat.opacity = 0.4;
    });

    parent.addEventListener('mousemove', (e) => {
        const rect = parent.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        hoverX = (x / rect.width - 0.5) * 2;
        hoverY = (y / rect.height - 0.5) * 2;
        
        targetRotationX = hoverY * 0.8;
        targetRotationY = hoverX * 0.8;
    });

    parent.addEventListener('mouseleave', () => {
        isHovered = false;
        targetRotationX = 0;
        targetRotationY = 0;
        const img = parent.querySelector('.profile-img');
        if (img) img.style.transform = 'scale(1)';
        material.opacity = 0.25;
        ringMat.opacity = 0.15;
    });

    window.addEventListener('themeChanged', () => {
        colors = getThemeColors();
        material.color.set(colors.heroMesh);
        ringMat.color.set(colors.heroMeshAlt);
        orbitalPointsMat.map = createCircleTexture(colors.heroParticles);
        orbitalPointsMat.needsUpdate = true;
    });

    // Resize observer for the hero card container
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const w = entry.contentRect.width || width;
            const h = entry.contentRect.height || height;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }
    });
    resizeObserver.observe(parent);

    // Animation Loop
    function animateHero() {
        requestAnimationFrame(animateHero);

        // Smoothly rotate core meshes
        torusKnot.rotation.y += isHovered ? 0.025 : 0.008;
        torusKnot.rotation.x += isHovered ? 0.015 : 0.004;

        outerRing.rotation.z -= isHovered ? 0.015 : 0.005;

        // Apply interactive tilt
        scene.rotation.x += (targetRotationX - scene.rotation.x) * 0.1;
        scene.rotation.y += (targetRotationY - scene.rotation.y) * 0.1;

        // Update particle orbital coordinates
        const positions = orbitPoints.geometry.attributes.position.array;
        for (let i = 0; i < orbitCount; i++) {
            const p = orbitalParticles[i];
            // Speed up orbiting if hovered
            p.angle += isHovered ? p.speed * 2.2 : p.speed;

            positions[i * 3] = Math.cos(p.angle) * p.radius;
            positions[i * 3 + 1] = Math.sin(p.angle) * p.radius * Math.cos(p.tilt);
            positions[i * 3 + 2] = Math.sin(p.angle) * p.radius * Math.sin(p.tilt);
        }
        orbitPoints.geometry.attributes.position.needsUpdate = true;

        // Slow float up/down of the group
        const time = Date.now() * 0.001;
        orbitGroup.position.y = Math.sin(time) * 0.15;
        torusKnot.position.y = Math.sin(time) * 0.15;

        renderer.render(scene, camera);
    }

    animateHero();
}


/* =========================================================================
   3. Hardware-Accelerated 3D Card Tilt Effect
   ========================================================================= */
function initCardTilt() {
    const cards = document.querySelectorAll(
        '.card, .project-card, .sem-card, .certification-card, .skills-card, .marksheet-card'
    );

    cards.forEach(card => {
        // Enforce 3D parent container structure
        const parent = card.parentElement;
        if (parent) {
            parent.style.perspective = '1000px';
        }
        
        card.style.transformStyle = 'preserve-3d';
        
        // Add subtle scale transition
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, box-shadow 0.3s';

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            
            // Mouse coordinates relative to card
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Normalized values between -0.5 and 0.5
            const normX = (x / rect.width) - 0.5;
            const normY = (y / rect.height) - 0.5;
            
            // Max rotation limits (degrees)
            const maxTilt = 12;
            const tiltX = -normY * maxTilt;
            const tiltY = normX * maxTilt;
            
            // Apply scale and 3D tilts
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.03, 1.03, 1.03) translateZ(10px)`;
            card.style.transition = 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)';
        });

        card.addEventListener('mouseleave', () => {
            // Smoothly reset transformations when mouse exits
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0px)';
            card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        });
    });
}
