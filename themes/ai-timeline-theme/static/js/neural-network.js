/*
 * Neural Network Canvas Animation
 * Provides a subtle animated neuronal network effect for the AI Timeline header.
 * Respects prefers-reduced-motion and mobile performance constraints.
 */
(function() {
    'use strict';

    /* -----------------------------------
     * Helpers
     * -----------------------------------*/
    function randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    /* -----------------------------------
     * Node Class
     * -----------------------------------*/
    class Node {
        constructor(x, y, radius, color) {
            this.baseX = x;
            this.baseY = y;
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.color = color;
            this.phase = randomRange(0, Math.PI * 2);
            this.speed = randomRange(0.3, 0.6); // Movement speed modifier
        }

        update(time) {
            // Gentle vertical oscillation
            this.y = this.baseY + Math.sin(time * this.speed + this.phase) * 8;
        }

        draw(ctx) {
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /* -----------------------------------
     * NeuralNetwork Class
     * -----------------------------------*/
    class NeuralNetwork {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.dpr = window.devicePixelRatio || 1;
            this.nodes = [];
            this.edges = [];
            this.pulses = [];
            this.maxPulses = 12;
            this.lastTimeSec = null;
            this.maxDistance = 200;
            this.connectionProbability = 0.18; // ~20% of potential connections
            this.mobileNodeCount = 12;
            this.desktopNodeCount = 28;
            this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            this.resize = this.resize.bind(this);
            this.animate = this.animate.bind(this);

            this.init();
        }

        init() {
            this.resize();
            this.createNodes();
            this.createConnections();
            this.pulses = [];
            window.addEventListener('resize', this.resize);
            if (!this.prefersReducedMotion) {
                requestAnimationFrame(this.animate);
            } else {
                this.drawStatic();
            }
        }

        createNodes() {
            this.nodes.length = 0; // Clear existing
            const isMobile = window.innerWidth < 600;
            const nodeCount = isMobile ? this.mobileNodeCount : this.desktopNodeCount;
            const colors = [
                'rgba(255, 255, 255, 0.9)',
                'rgba(230, 230, 230, 0.9)',
                'rgba(200, 200, 200, 0.9)'
            ];
            for (let i = 0; i < nodeCount; i++) {
                const x = randomRange(0, this.width);
                const y = randomRange(0, this.height);
                const r = randomRange(1.8, 3.2); // slightly smaller for density
                const color = colors[Math.floor(Math.random() * colors.length)];
                this.nodes.push(new Node(x, y, r, color));
            }
            this.createConnections();
        }

        createConnections() {
            this.edges.length = 0;
            for (let i = 0; i < this.nodes.length; i++) {
                for (let j = i + 1; j < this.nodes.length; j++) {
                    const a = this.nodes[i];
                    const b = this.nodes[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < this.maxDistance && Math.random() < this.connectionProbability) {
                        this.edges.push({ i, j, dist });
                    }
                }
            }
        }

        drawConnections(time) {
            const ctx = this.ctx;
            this.edges.forEach(edge => {
                const a = this.nodes[edge.i];
                const b = this.nodes[edge.j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = edge.dist;

                const alpha = 1 - dist / this.maxDistance;
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            });
        }

        update(time) {
            this.nodes.forEach(node => node.update(time));
        }

        clear() {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }

        drawStatic() {
            // Single frame for reduced motion
            this.clear();
            this.nodes.forEach(node => node.draw(this.ctx));
            this.drawConnections(0);
        }

        draw(time) {
            this.clear();
            // Draw connections first to keep nodes on top
            this.drawConnections(time);
            // Draw nodes
            this.nodes.forEach(node => node.draw(this.ctx));
            // Draw pulses on top
            this.drawPulses();
        }

        animate() {
            const now = performance.now();
            const nowSec = now * 0.001;
            const dt = this.lastTimeSec !== null ? (nowSec - this.lastTimeSec) : 0;
            this.lastTimeSec = nowSec;

            // Update
            this.update(nowSec);
            this.updatePulses(dt);

            // Render
            this.draw(nowSec);

            requestAnimationFrame(this.animate);
        }

        /* -----------------------------------
         * Pulse System
         * -----------------------------------*/
        spawnPulse() {
            if (this.edges.length === 0) return;
            const edgeIndex = Math.floor(Math.random() * this.edges.length);
            const direction = Math.random() < 0.5 ? 1 : -1; // forward or reverse
            const speed = randomRange(1.2, 2.0); // progress per second, faster
            this.pulses.push({ edgeIndex, progress: direction === 1 ? 0 : 1, speed, direction });
        }

        updatePulses(dt) {
            // Spawn new pulses probabilistically
            if (this.pulses.length < this.maxPulses && Math.random() < 0.05) {
                this.spawnPulse();
            }

            // Update existing pulses
            this.pulses.forEach(p => {
                p.progress += p.speed * dt * p.direction;
            });

            // Remove completed pulses
            this.pulses = this.pulses.filter(p => p.progress >= 0 && p.progress <= 1);
        }

        drawPulses() {
            const ctx = this.ctx;
            this.pulses.forEach(p => {
                const edge = this.edges[p.edgeIndex];
                const a = this.nodes[edge.i];
                const b = this.nodes[edge.j];
                const sx = a.x + (b.x - a.x) * p.progress;
                const sy = a.y + (b.y - a.y) * p.progress;
                ctx.beginPath();
                ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        resize() {
            const rect = this.canvas.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
            this.canvas.width = this.width * this.dpr;
            this.canvas.height = this.height * this.dpr;
            this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset any prior transforms
            this.ctx.scale(this.dpr, this.dpr);
            // Recreate nodes and edges on resize for proper distribution
            this.createNodes();
            this.createConnections();
            this.pulses = [];
            if (this.prefersReducedMotion) {
                this.drawStatic();
            }
        }
    }

    /* -----------------------------------
     * Bootstrapping
     * -----------------------------------*/
    document.addEventListener('DOMContentLoaded', () => {
        const canvas = document.getElementById('neural-network');
        if (!canvas) return;
        new NeuralNetwork(canvas);
    });
})(); 