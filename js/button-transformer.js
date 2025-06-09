// Button Transformer Service
class ButtonTransformer {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // Add hover effects to all buttons with transform class
            const buttons = document.querySelectorAll('.transform-button');
            buttons.forEach(button => {
                this.addHoverEffect(button);
            });

            // Add click effects to all buttons with ripple class
            const rippleButtons = document.querySelectorAll('.ripple-button');
            rippleButtons.forEach(button => {
                this.addRippleEffect(button);
            });

            // Add floating effects to all buttons with float class
            const floatingButtons = document.querySelectorAll('.float-button');
            floatingButtons.forEach(button => {
                this.addFloatingEffect(button);
            });

            // Add glow effects to all buttons with glow class
            const glowButtons = document.querySelectorAll('.glow-button');
            glowButtons.forEach(button => {
                this.addGlowEffect(button);
            });
        });

        // Handle dynamic content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        const buttons = node.querySelectorAll('.transform-button');
                        buttons.forEach(button => this.addHoverEffect(button));

                        const rippleButtons = node.querySelectorAll('.ripple-button');
                        rippleButtons.forEach(button => this.addRippleEffect(button));

                        const floatingButtons = node.querySelectorAll('.float-button');
                        floatingButtons.forEach(button => this.addFloatingEffect(button));

                        const glowButtons = node.querySelectorAll('.glow-button');
                        glowButtons.forEach(button => this.addGlowEffect(button));
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    addHoverEffect(button) {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            button.style.setProperty('--x', `${x}px`);
            button.style.setProperty('--y', `${y}px`);
        });
    }

    addRippleEffect(button) {
        button.addEventListener('click', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            button.appendChild(ripple);

            setTimeout(() => ripple.remove(), 1000);
        });
    }

    addFloatingEffect(button) {
        let floating = false;
        let frame;
        let start;

        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            
            const y = Math.sin(progress / 1000) * 10;
            button.style.transform = `translateY(${y}px)`;

            if (floating) {
                frame = requestAnimationFrame(animate);
            }
        };

        button.addEventListener('mouseenter', () => {
            if (!floating) {
                floating = true;
                start = null;
                frame = requestAnimationFrame(animate);
            }
        });

        button.addEventListener('mouseleave', () => {
            floating = false;
            if (frame) {
                cancelAnimationFrame(frame);
            }
            button.style.transform = '';
        });
    }

    addGlowEffect(button) {
        let glowing = false;
        let frame;
        let start;

        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            
            const opacity = (Math.sin(progress / 1000) + 1) / 2;
            button.style.boxShadow = `0 0 20px rgba(236, 72, 153, ${opacity})`;

            if (glowing) {
                frame = requestAnimationFrame(animate);
            }
        };

        button.addEventListener('mouseenter', () => {
            if (!glowing) {
                glowing = true;
                start = null;
                frame = requestAnimationFrame(animate);
            }
        });

        button.addEventListener('mouseleave', () => {
            glowing = false;
            if (frame) {
                cancelAnimationFrame(frame);
            }
            button.style.boxShadow = '';
        });
    }

    // Add CSS styles to document
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .transform-button {
                position: relative;
                overflow: hidden;
            }

            .transform-button::before {
                content: '';
                position: absolute;
                width: 100px;
                height: 100px;
                background: radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s;
            }

            .transform-button:hover::before {
                opacity: 1;
                left: var(--x);
                top: var(--y);
            }

            .ripple-button {
                position: relative;
                overflow: hidden;
            }

            .ripple {
                position: absolute;
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 1s linear;
                background-color: rgba(236, 72, 153, 0.3);
            }

            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }

            .float-button {
                transition: transform 0.3s;
            }

            .glow-button {
                transition: box-shadow 0.3s;
            }
        `;
        document.head.appendChild(style);
    }
}

// Create and initialize button transformer
const buttonTransformer = new ButtonTransformer();
buttonTransformer.addStyles();

export default buttonTransformer;
