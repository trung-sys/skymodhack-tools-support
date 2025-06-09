// Dragon Cursor Animation Service
class DragonCursor {
    constructor() {
        this.dragon = null;
        this.trail = [];
        this.maxTrail = 20;
        this.init();
    }

    init() {
        // Add styles
        this.addStyles();
        
        // Create dragon cursor
        this.createDragon();
        
        // Set up event listeners
        this.setupEventListeners();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .dragon-cursor {
                position: fixed;
                pointer-events: none;
                z-index: 10000;
                width: 30px;
                height: 30px;
                transform: translate(-50%, -50%);
                transition: transform 0.1s ease;
            }

            .dragon-cursor svg {
                width: 100%;
                height: 100%;
                fill: rgba(236, 72, 153, 0.8);
                filter: drop-shadow(0 0 5px rgba(236, 72, 153, 0.5));
            }

            .dragon-trail {
                position: fixed;
                pointer-events: none;
                width: 10px;
                height: 10px;
                background: radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, transparent 70%);
                border-radius: 50%;
                z-index: 9999;
                transition: all 0.2s ease;
            }

            .dragon-cursor.active svg {
                animation: dragonPulse 0.5s infinite;
            }

            @keyframes dragonPulse {
                0% {
                    transform: scale(1);
                    filter: drop-shadow(0 0 5px rgba(236, 72, 153, 0.5));
                }
                50% {
                    transform: scale(1.2);
                    filter: drop-shadow(0 0 10px rgba(236, 72, 153, 0.7));
                }
                100% {
                    transform: scale(1);
                    filter: drop-shadow(0 0 5px rgba(236, 72, 153, 0.5));
                }
            }
        `;
        document.head.appendChild(style);
    }

    createDragon() {
        this.dragon = document.createElement('div');
        this.dragon.className = 'dragon-cursor';
        this.dragon.innerHTML = `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 50 C20 30 40 20 50 20 C60 20 80 30 80 50 C80 70 60 80 50 80 C40 80 20 70 20 50 Z"/>
                <circle cx="35" cy="45" r="3"/>
                <circle cx="65" cy="45" r="3"/>
                <path d="M40 60 Q50 65 60 60" fill="none" stroke="white" stroke-width="2"/>
            </svg>
        `;
        document.body.appendChild(this.dragon);
    }

    setupEventListeners() {
        // Track mouse movement
        document.addEventListener('mousemove', (e) => this.updatePosition(e));

        // Track clicks
        document.addEventListener('mousedown', () => this.onMouseDown());
        document.addEventListener('mouseup', () => this.onMouseUp());

        // Track interactive elements
        document.addEventListener('mouseover', (e) => this.handleHover(e));
        document.addEventListener('mouseout', (e) => this.handleHoverEnd(e));
    }

    updatePosition(e) {
        if (!this.dragon) return;

        // Update dragon position
        const x = e.clientX;
        const y = e.clientY;
        this.dragon.style.transform = `translate(${x}px, ${y}px)`;

        // Update trail
        this.updateTrail(x, y);
    }

    updateTrail(x, y) {
        // Create new trail particle
        const particle = document.createElement('div');
        particle.className = 'dragon-trail';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        document.body.appendChild(particle);

        // Add to trail array
        this.trail.push({
            element: particle,
            createdAt: Date.now()
        });

        // Remove old trail particles
        this.cleanupTrail();
    }

    cleanupTrail() {
        const now = Date.now();
        this.trail = this.trail.filter(particle => {
            if (now - particle.createdAt > 1000) {
                particle.element.remove();
                return false;
            }
            return true;
        });

        // Limit trail length
        while (this.trail.length > this.maxTrail) {
            const particle = this.trail.shift();
            particle.element.remove();
        }
    }

    onMouseDown() {
        if (!this.dragon) return;
        this.dragon.classList.add('active');
        
        // Create click effect
        const x = parseFloat(this.dragon.style.transform.split('(')[1]);
        const y = parseFloat(this.dragon.style.transform.split(',')[1]);
        this.createClickEffect(x, y);
    }

    onMouseUp() {
        if (!this.dragon) return;
        this.dragon.classList.remove('active');
    }

    handleHover(e) {
        const interactive = e.target.closest('button, a, input, select, textarea');
        if (interactive && this.dragon) {
            this.dragon.classList.add('active');
            this.dragon.style.transform += ' scale(0.8)';
        }
    }

    handleHoverEnd(e) {
        const interactive = e.target.closest('button, a, input, select, textarea');
        if (interactive && this.dragon) {
            this.dragon.classList.remove('active');
            this.dragon.style.transform = this.dragon.style.transform.replace(' scale(0.8)', '');
        }
    }

    createClickEffect(x, y) {
        const effect = document.createElement('div');
        effect.className = 'dragon-trail';
        effect.style.left = `${x}px`;
        effect.style.top = `${y}px`;
        effect.style.width = '30px';
        effect.style.height = '30px';
        effect.style.animation = 'dragonPulse 0.5s forwards';
        document.body.appendChild(effect);

        setTimeout(() => effect.remove(), 500);
    }

    destroy() {
        if (this.dragon) {
            this.dragon.remove();
            this.dragon = null;
        }
        this.trail.forEach(particle => particle.element.remove());
        this.trail = [];
    }
}

// Create and export dragon cursor instance
const dragonCursor = new DragonCursor();
export default dragonCursor;
