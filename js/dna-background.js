/**
 * DocNile - 3D DNA Helix Background
 * Creates an animated DNA double helix using Three.js
 */

(function () {
    'use strict';

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Scene setup
    const canvas = document.getElementById('dna-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // DNA Parameters
    const dnaParams = {
        helixRadius: 2,
        helixHeight: 40,
        turns: 8,
        pointsPerTurn: 20,
        sphereRadius: 0.15,
        connectionRadius: 0.05,
        opacity: 0.5
    };

    // Colors
    const colors = {
        strand1: new THREE.Color(0x63b3ed), // Light blue
        strand2: new THREE.Color(0x4299e1), // Accent blue
        connection: new THREE.Color(0xbee3f8) // Pale blue
    };

    // Create DNA group
    const dnaGroup = new THREE.Group();
    scene.add(dnaGroup);

    // Materials
    const strand1Material = new THREE.MeshBasicMaterial({
        color: colors.strand1,
        transparent: true,
        opacity: dnaParams.opacity
    });

    const strand2Material = new THREE.MeshBasicMaterial({
        color: colors.strand2,
        transparent: true,
        opacity: dnaParams.opacity
    });

    const connectionMaterial = new THREE.MeshBasicMaterial({
        color: colors.connection,
        transparent: true,
        opacity: dnaParams.opacity * 0.6
    });

    // Sphere geometry (reused)
    const sphereGeometry = new THREE.SphereGeometry(dnaParams.sphereRadius, 16, 16);

    // Create DNA strands
    const totalPoints = dnaParams.turns * dnaParams.pointsPerTurn;

    for (let i = 0; i < totalPoints; i++) {
        const t = i / totalPoints;
        const angle = t * Math.PI * 2 * dnaParams.turns;
        const y = (t - 0.5) * dnaParams.helixHeight;

        // Strand 1
        const x1 = Math.cos(angle) * dnaParams.helixRadius;
        const z1 = Math.sin(angle) * dnaParams.helixRadius;

        const sphere1 = new THREE.Mesh(sphereGeometry, strand1Material);
        sphere1.position.set(x1, y, z1);
        dnaGroup.add(sphere1);

        // Strand 2 (opposite side)
        const x2 = Math.cos(angle + Math.PI) * dnaParams.helixRadius;
        const z2 = Math.sin(angle + Math.PI) * dnaParams.helixRadius;

        const sphere2 = new THREE.Mesh(sphereGeometry, strand2Material);
        sphere2.position.set(x2, y, z2);
        dnaGroup.add(sphere2);

        // Connections (base pairs) - every 3rd point
        if (i % 3 === 0) {
            const connectionGeometry = new THREE.CylinderGeometry(
                dnaParams.connectionRadius,
                dnaParams.connectionRadius,
                dnaParams.helixRadius * 2,
                8
            );

            const connection = new THREE.Mesh(connectionGeometry, connectionMaterial);
            connection.position.set(0, y, 0);
            connection.rotation.z = Math.PI / 2;
            connection.rotation.y = angle;
            dnaGroup.add(connection);
        }

        // Connect spheres along strand with tubes
        if (i > 0) {
            const prevT = (i - 1) / totalPoints;
            const prevAngle = prevT * Math.PI * 2 * dnaParams.turns;
            const prevY = (prevT - 0.5) * dnaParams.helixHeight;

            // Strand 1 connection
            const prevX1 = Math.cos(prevAngle) * dnaParams.helixRadius;
            const prevZ1 = Math.sin(prevAngle) * dnaParams.helixRadius;

            createTube(
                new THREE.Vector3(prevX1, prevY, prevZ1),
                new THREE.Vector3(x1, y, z1),
                strand1Material
            );

            // Strand 2 connection
            const prevX2 = Math.cos(prevAngle + Math.PI) * dnaParams.helixRadius;
            const prevZ2 = Math.sin(prevAngle + Math.PI) * dnaParams.helixRadius;

            createTube(
                new THREE.Vector3(prevX2, prevY, prevZ2),
                new THREE.Vector3(x2, y, z2),
                strand2Material
            );
        }
    }

    function createTube(start, end, material) {
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();

        const tubeGeometry = new THREE.CylinderGeometry(
            dnaParams.connectionRadius * 0.8,
            dnaParams.connectionRadius * 0.8,
            length,
            8
        );

        const tube = new THREE.Mesh(tubeGeometry, material);
        tube.position.copy(start.clone().add(end).multiplyScalar(0.5));
        tube.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction.clone().normalize()
        );

        dnaGroup.add(tube);
    }

    // Position camera
    camera.position.z = 15;
    camera.position.y = 0;

    // Animation variables
    let scrollY = 0;
    let targetRotationY = 0;

    // Handle scroll for parallax
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    // Handle resize
    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onResize);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Slow continuous rotation
        dnaGroup.rotation.y += 0.001;

        // Subtle parallax based on scroll
        const scrollOffset = scrollY * 0.0005;
        dnaGroup.rotation.x = scrollOffset * 0.5;
        dnaGroup.position.y = -scrollOffset * 5;

        renderer.render(scene, camera);
    }

    animate();

})();
