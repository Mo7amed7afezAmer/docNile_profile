/**
 * DocNile - Particle Network + Data Flow Background
 * Creates animated particles with connection lines and flowing data streaks
 */

(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let dataStreaks = [];
    let mouseX = -1000, mouseY = -1000;
    let animationId;

    // Configuration
    const config = {
        particleCount: 80,
        particleMinRadius: 1,
        particleMaxRadius: 2.5,
        connectionDistance: 150,
        mouseRadius: 200,
        speed: 0.3,
        streakCount: 5,
        colors: {
            particle: 'rgba(0, 212, 170, VAL)',
            connection: 'rgba(0, 212, 170, VAL)',
            streakHead: 'rgba(0, 212, 170, 0.8)',
            streakTail: 'rgba(0, 180, 216, 0.0)',
            mouseGlow: 'rgba(0, 212, 170, 0.04)'
        }
    };

    // Particle class
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = config.particleMinRadius + Math.random() * (config.particleMaxRadius - config.particleMinRadius);
            this.vx = (Math.random() - 0.5) * config.speed;
            this.vy = (Math.random() - 0.5) * config.speed;
            this.baseAlpha = 0.15 + Math.random() * 0.35;
            this.alpha = this.baseAlpha;
            this.pulsePhase = Math.random() * Math.PI * 2;
            this.pulseSpeed = 0.005 + Math.random() * 0.01;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Pulse effect
            this.pulsePhase += this.pulseSpeed;
            this.alpha = this.baseAlpha + Math.sin(this.pulsePhase) * 0.1;

            // Wrap around edges
            if (this.x < -20) this.x = width + 20;
            if (this.x > width + 20) this.x = -20;
            if (this.y < -20) this.y = height + 20;
            if (this.y > height + 20) this.y = -20;

            // Mouse proximity glow
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < config.mouseRadius) {
                const influence = 1 - (dist / config.mouseRadius);
                this.alpha = Math.min(0.8, this.baseAlpha + influence * 0.5);
                // Subtle push
                this.vx += (dx / dist) * influence * 0.02;
                this.vy += (dy / dist) * influence * 0.02;
            }

            // Dampen velocity
            this.vx *= 0.999;
            this.vy *= 0.999;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = config.colors.particle.replace('VAL', this.alpha.toFixed(3));
            ctx.fill();

            // Glow ring for brighter particles
            if (this.alpha > 0.3) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
                ctx.fillStyle = config.colors.particle.replace('VAL', (this.alpha * 0.1).toFixed(3));
                ctx.fill();
            }
        }
    }

    // Data streak class — flowing lines
    class DataStreak {
        constructor() {
            this.reset();
        }

        reset() {
            this.startX = Math.random() * width;
            this.startY = -50;
            this.x = this.startX;
            this.y = this.startY;
            this.length = 60 + Math.random() * 120;
            this.speed = 1 + Math.random() * 2;
            this.angle = (Math.PI / 2) + (Math.random() - 0.5) * 0.4; // Mostly downward
            this.alpha = 0.08 + Math.random() * 0.15;
            this.lineWidth = 0.5 + Math.random() * 1;
        }

        update() {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;

            if (this.y > height + this.length) {
                this.reset();
            }
        }

        draw() {
            const endX = this.x - Math.cos(this.angle) * this.length;
            const endY = this.y - Math.sin(this.angle) * this.length;

            const gradient = ctx.createLinearGradient(this.x, this.y, endX, endY);
            gradient.addColorStop(0, `rgba(0, 212, 170, ${this.alpha})`);
            gradient.addColorStop(1, 'rgba(0, 180, 216, 0)');

            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = this.lineWidth;
            ctx.stroke();
        }
    }

    function init() {
        resize();
        particles = [];
        dataStreaks = [];

        const count = Math.min(config.particleCount, Math.floor((width * height) / 15000));
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
        for (let i = 0; i < config.streakCount; i++) {
            const streak = new DataStreak();
            streak.y = Math.random() * height; // Start at random positions
            dataStreaks.push(streak);
        }
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * Math.min(window.devicePixelRatio, 2);
        canvas.height = height * Math.min(window.devicePixelRatio, 2);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(Math.min(window.devicePixelRatio, 2), Math.min(window.devicePixelRatio, 2));
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < config.connectionDistance) {
                    const alpha = (1 - dist / config.connectionDistance) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = config.colors.connection.replace('VAL', alpha.toFixed(3));
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function drawMouseGlow() {
        if (mouseX < 0) return;
        const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, config.mouseRadius);
        gradient.addColorStop(0, config.colors.mouseGlow);
        gradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, config.mouseRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw data streaks behind everything
        dataStreaks.forEach(s => { s.update(); s.draw(); });

        // Connections
        drawConnections();

        // Mouse glow
        drawMouseGlow();

        // Particles
        particles.forEach(p => { p.update(); p.draw(); });

        animationId = requestAnimationFrame(animate);
    }

    // Event listeners
    window.addEventListener('resize', () => {
        resize();
        // Re-populate if needed
        const count = Math.min(config.particleCount, Math.floor((width * height) / 15000));
        while (particles.length < count) particles.push(new Particle());
        while (particles.length > count) particles.pop();
    });

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouseX = -1000;
        mouseY = -1000;
    });

    // Initialize
    init();
    animate();

})();
