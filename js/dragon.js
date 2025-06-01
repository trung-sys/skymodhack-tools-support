document.addEventListener('DOMContentLoaded', () => {
    const dragon = document.getElementById('dragon-container');
    if (!dragon) {
        console.error('Dragon container not found!');
        return;
    }
    
    // Initialize positions and trail
    let targetX = window.innerWidth / 2, targetY = window.innerHeight / 2;
    let currentX = targetX, currentY = targetY;
    let trail = [];
    let tail = [];
    let particles = [];
    const trailLength = 15;
    const tailLength = 35;
    const speed = 0.06;
    let currentAngle = 0;
    
    // Create trail elements
    for (let i = 0; i < trailLength; i++) {
        const trailDot = document.createElement('div');
        trailDot.className = 'trail-dot';
        trailDot.style.opacity = (1 - i / trailLength) * 0.7;
        document.body.appendChild(trailDot);
        trail.push({
            element: trailDot,
            x: 0,
            y: 0
        });
    }

    // Create tail segments
    for (let i = 0; i < tailLength; i++) {
        const tailSegment = document.createElement('div');
        tailSegment.className = 'dragon-tail';
        
        const redComponent = Math.floor((i / tailLength) * 255);
        const blackComponent = Math.floor((1 - i / tailLength) * 50);
        tailSegment.style.background = `rgb(${redComponent}, ${blackComponent}, ${blackComponent})`;
        
        const size = 14 - (i * 0.25);
        tailSegment.style.width = `${size}px`;
        tailSegment.style.height = `${size}px`;
        tailSegment.style.opacity = (1 - i / tailLength) * 0.95;
        
        document.body.appendChild(tailSegment);
        tail.push({
            element: tailSegment,
            x: 0,
            y: 0,
            angle: 0,
            wave: 0
        });
    }

    // Create particle effect
    function createParticle(x, y, isFireball = false, angle = 0) {
        const particle = document.createElement('div');
        particle.className = isFireball ? 'fireball' : 'particle';
        document.body.appendChild(particle);
        
        let particleAngle;
        if (isFireball) {
            // Create cone of fire in the direction the dragon is facing
            particleAngle = angle + (Math.random() - 0.5) * Math.PI / 3; // 60-degree cone
        } else {
            particleAngle = Math.random() * Math.PI * 2;
        }
        
        const velocity = isFireball ? 12 + Math.random() * 6 : 2 + Math.random() * 2;
        const lifetime = isFireball ? 1000 + Math.random() * 500 : 500 + Math.random() * 500;
        const size = isFireball ? 15 + Math.random() * 10 : 4 + Math.random() * 4;
        
        particles.push({
            element: particle,
            x,
            y,
            vx: Math.cos(particleAngle) * velocity,
            vy: Math.sin(particleAngle) * velocity,
            life: lifetime,
            maxLife: lifetime,
            size,
            isFireball,
            rotation: Math.random() * 360
        });
    }

    // Create trail effect
    function createTrailEffect(x, y) {
        for (let i = 0; i < 3; i++) {
            createParticle(x, y);
        }
    }

    // Create fire breath effect
    function createFireBreath(x, y, angle) {
        const fireballCount = 12;
        for (let i = 0; i < fireballCount; i++) {
            setTimeout(() => {
                createParticle(x, y, true, angle - Math.PI/2);
            }, i * 50);
        }
    }

    // Handle clicking on elements
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target.tagName === 'BUTTON' || target.tagName === 'A' || 
            target.closest('button') || target.closest('a')) {
            // Calculate position relative to the clicked element
            const rect = target.getBoundingClientRect();
            const elementX = rect.left + rect.width / 2;
            const elementY = rect.top + rect.height / 2;
            
            // Create fire breath effect
            createFireBreath(currentX, currentY, currentAngle);
            
            // Move dragon to the clicked element
            targetX = elementX;
            targetY = elementY;
        }
    });

    function animate() {
        // Smooth movement
        currentX += (targetX - currentX) * speed;
        currentY += (targetY - currentY) * speed;
        
        const dx = targetX - currentX;
        const dy = targetY - currentY;
        const angle = Math.atan2(dy, dx);
        currentAngle += (angle - currentAngle) * speed * 2;
        
        // Update dragon
        dragon.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${currentAngle * 180/Math.PI + 90}deg)`;
        
        // Update trail
        for (let i = trail.length - 1; i >= 0; i--) {
            if (i === 0) {
                trail[i].x = currentX;
                trail[i].y = currentY;
            } else {
                const prevX = trail[i-1].x;
                const prevY = trail[i-1].y;
                const followSpeed = speed * (1.2 - i * 0.02);
                trail[i].x += (prevX - trail[i].x) * followSpeed;
                trail[i].y += (prevY - trail[i].y) * followSpeed;
            }
            
            trail[i].element.style.transform = `translate(${trail[i].x}px, ${trail[i].y}px)`;
        }

        // Update tail with enhanced wave effect
        const time = Date.now() * 0.002;
        let prevX = currentX;
        let prevY = currentY;
        let prevAngle = currentAngle;
        
        for (let i = 0; i < tail.length; i++) {
            const delay = i * 0.2;
            const waveAmplitude = 30 - (i * 0.4);
            const waveFrequency = 0.15;
            
            const targetWave = Math.sin((time - delay) * waveFrequency) * waveAmplitude;
            tail[i].wave += (targetWave - tail[i].wave) * speed;
            
            const dx = prevX - tail[i].x;
            const dy = prevY - tail[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                const normalX = dx / distance;
                const normalY = dy / distance;
                const spacing = 12 + i * 1.5;
                
                const targetX = prevX - normalX * spacing + normalY * tail[i].wave;
                const targetY = prevY - normalY * spacing - normalX * tail[i].wave;
                
                const segmentSpeed = speed * (1.2 - i * 0.015);
                tail[i].x += (targetX - tail[i].x) * segmentSpeed;
                tail[i].y += (targetY - tail[i].y) * segmentSpeed;
                
                prevX = tail[i].x;
                prevY = tail[i].y;
                
                const segmentAngle = Math.atan2(dy, dx);
                tail[i].angle += (segmentAngle - tail[i].angle) * speed;
                prevAngle = tail[i].angle;
                
                const scale = 1 - (i * 0.01);
                tail[i].element.style.transform = 
                    `translate(${tail[i].x}px, ${tail[i].y}px) rotate(${tail[i].angle * 180/Math.PI}deg) scale(${scale})`;
                
                if (i % 5 === 0 && Math.random() < 0.1) {
                    createTrailEffect(tail[i].x, tail[i].y);
                }
            }
        }

        // Update particles
        particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 16;
            
            if (particle.isFireball) {
                particle.vy += 0.2; // Gravity
                particle.vx *= 0.99; // Air resistance
                particle.rotation += 10; // Rotation
            }
            
            const progress = particle.life / particle.maxLife;
            const scale = particle.isFireball ? 
                progress * (particle.size / 15) :
                progress * (particle.size / 4);
            
            particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px) scale(${scale}) rotate(${particle.rotation}deg)`;
            particle.element.style.opacity = progress;
            
            if (particle.life <= 0) {
                particle.element.remove();
                particles.splice(index, 1);
            }
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Enhanced mouse tracking
    let lastUpdate = 0;
    const throttleInterval = 16;
    let lastX = 0, lastY = 0;
    
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastUpdate > throttleInterval) {
            // Add smooth easing to mouse movement
            targetX = e.clientX;
            targetY = e.clientY;
            
            // Update last positions with smooth interpolation
            lastX = lastX + (targetX - lastX) * 0.3;
            lastY = lastY + (targetY - lastY) * 0.3;
            lastUpdate = now;
        }
    });

    // Initial positioning at page load
    window.addEventListener('load', () => {
        targetX = window.innerWidth / 2;
        targetY = window.innerHeight / 2;
        currentX = targetX;
        currentY = targetY;
        lastX = targetX;
        lastY = targetY;
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (targetX > window.innerWidth) {
            targetX = window.innerWidth / 2;
            currentX = targetX;
            lastX = targetX;
        }
        if (targetY > window.innerHeight) {
            targetY = window.innerHeight / 2;
            currentY = targetY;
            lastY = targetY;
        }
    });
    
    // Cleanup
    window.addEventListener('unload', () => {
        trail.forEach(t => t.element.remove());
        tail.forEach(t => t.element.remove());
        particles.forEach(p => p.element.remove());
    });
});
