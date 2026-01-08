/**
 * MPK Mini Playbook - Floating Particles
 * Subtle geometric background particles for premium effect
 */

export class ParticleSystem {
  constructor(containerId = 'particle-container') {
    this.containerId = containerId;
    this.container = null;
    this.particles = [];
    this.animationId = null;
    this.isRunning = false;
    
    // Configuration
    this.config = {
      particleCount: 15,
      shapes: ['circle', 'triangle', 'hexagon'],
      minSize: 8,
      maxSize: 24,
      minOpacity: 0.03,
      maxOpacity: 0.08,
      minSpeed: 0.2,
      maxSpeed: 0.5,
      colors: [
        'rgba(255, 61, 0, VAR)',    // Akai orange
        'rgba(139, 92, 246, VAR)',  // FL Purple
        'rgba(255, 255, 255, VAR)'  // White
      ]
    };
  }

  init() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.createContainer();
    this.createParticles();
    this.start();

    // Cleanup on page navigation
    window.addEventListener('beforeunload', () => this.destroy());
  }

  createContainer() {
    // Remove existing container if present
    const existing = document.getElementById(this.containerId);
    if (existing) existing.remove();

    this.container = document.createElement('div');
    this.container.id = this.containerId;
    this.container.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    `;
    document.body.insertBefore(this.container, document.body.firstChild);
  }

  createParticles() {
    for (let i = 0; i < this.config.particleCount; i++) {
      const particle = this.createParticle();
      this.particles.push(particle);
      this.container.appendChild(particle.element);
    }
  }

  createParticle() {
    const shape = this.config.shapes[Math.floor(Math.random() * this.config.shapes.length)];
    const size = this.randomBetween(this.config.minSize, this.config.maxSize);
    const opacity = this.randomBetween(this.config.minOpacity, this.config.maxOpacity);
    const colorTemplate = this.config.colors[Math.floor(Math.random() * this.config.colors.length)];
    const color = colorTemplate.replace('VAR', opacity.toString());
    
    const element = document.createElement('div');
    element.className = `particle particle-${shape}`;
    
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const speed = this.randomBetween(this.config.minSpeed, this.config.maxSpeed);
    const direction = Math.random() * Math.PI * 2;
    const rotationSpeed = (Math.random() - 0.5) * 0.5;
    
    // Base styles
    element.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      opacity: ${opacity};
      will-change: transform;
      transform: rotate(0deg);
    `;
    
    // Shape-specific styling
    switch (shape) {
      case 'circle':
        element.style.borderRadius = '50%';
        element.style.background = color;
        break;
      case 'triangle':
        element.style.width = '0';
        element.style.height = '0';
        element.style.borderLeft = `${size/2}px solid transparent`;
        element.style.borderRight = `${size/2}px solid transparent`;
        element.style.borderBottom = `${size}px solid ${color}`;
        element.style.background = 'transparent';
        break;
      case 'hexagon':
        element.style.clipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
        element.style.background = color;
        break;
    }
    
    return {
      element,
      x,
      y,
      vx: Math.cos(direction) * speed,
      vy: Math.sin(direction) * speed,
      rotation: 0,
      rotationSpeed,
      size
    };
  }

  randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  update() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.particles.forEach(particle => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += particle.rotationSpeed;
      
      // Wrap around edges
      if (particle.x < -particle.size) particle.x = width + particle.size;
      if (particle.x > width + particle.size) particle.x = -particle.size;
      if (particle.y < -particle.size) particle.y = height + particle.size;
      if (particle.y > height + particle.size) particle.y = -particle.size;
      
      // Apply transform
      particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px) rotate(${particle.rotation}deg)`;
      particle.element.style.left = '0';
      particle.element.style.top = '0';
    });
  }

  animate() {
    if (!this.isRunning) return;
    this.update();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy() {
    this.stop();
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    this.particles = [];
  }
}

// Auto-initialize on import
let particleSystem = null;

export function initParticles() {
  if (particleSystem) {
    particleSystem.destroy();
  }
  particleSystem = new ParticleSystem();
  particleSystem.init();
}

export function destroyParticles() {
  if (particleSystem) {
    particleSystem.destroy();
    particleSystem = null;
  }
}

export default ParticleSystem;
