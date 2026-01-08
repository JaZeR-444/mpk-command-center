/**
 * MPK Mini Playbook - Custom Cursor
 * Music note cursor with interactive effects
 */

export class CustomCursor {
  constructor() {
    this.cursor = null;
    this.isVisible = true;
    this.isHovering = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.currentX = 0;
    this.currentY = 0;
  }

  init() {
    // Check for touch device
    if ('ontouchstart' in window) {
      return;
    }
    
    // Check for reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.createCursor();
    this.addEventListeners();
    this.animate();
  }

  createCursor() {
    // Music note cursor
    this.cursor = document.createElement('div');
    this.cursor.className = 'custom-cursor';
    this.cursor.innerHTML = '♪';
    this.cursor.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      font-size: 24px;
      color: rgba(255, 77, 28, 0.9);
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%, -50%);
      transition: color 0.15s ease, transform 0.15s ease, text-shadow 0.15s ease;
      text-shadow: 0 0 10px rgba(255, 77, 28, 0.5);
      font-family: sans-serif;
    `;

    document.body.appendChild(this.cursor);

    // Hide default cursor
    document.body.style.cursor = 'none';
  }

  addEventListeners() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    // Interactive elements
    const interactiveElements = 'a, button, [onclick], .path-card, .featured-card, .proof-card, .hero-visualizer-preview, input, textarea, .nav-link, .accordion-trigger';
    
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveElements)) {
        this.setHover(true);
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveElements)) {
        this.setHover(false);
      }
    });

    // Click effect - bounce
    document.addEventListener('mousedown', () => {
      this.cursor.style.transform = 'translate(-50%, -50%) scale(0.8) rotate(-15deg)';
    });

    document.addEventListener('mouseup', () => {
      this.cursor.style.transform = 'translate(-50%, -50%) scale(1) rotate(0deg)';
    });

    // Hide when leaving window
    document.addEventListener('mouseleave', () => {
      this.cursor.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      this.cursor.style.opacity = '1';
    });
  }

  setHover(isHovering) {
    this.isHovering = isHovering;
    
    if (isHovering) {
      // Change to double note and purple on hover
      this.cursor.innerHTML = '♫';
      this.cursor.style.color = 'rgba(155, 109, 255, 1)';
      this.cursor.style.textShadow = '0 0 15px rgba(155, 109, 255, 0.6)';
      this.cursor.style.transform = 'translate(-50%, -50%) scale(1.1)';
    } else {
      // Back to single note orange
      this.cursor.innerHTML = '♪';
      this.cursor.style.color = 'rgba(255, 77, 28, 0.9)';
      this.cursor.style.textShadow = '0 0 10px rgba(255, 77, 28, 0.5)';
      this.cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    }
  }

  animate() {
    // Smooth follow
    const ease = 0.15;
    this.currentX += (this.mouseX - this.currentX) * ease;
    this.currentY += (this.mouseY - this.currentY) * ease;
    
    this.cursor.style.left = `${this.currentX}px`;
    this.cursor.style.top = `${this.currentY}px`;
    
    requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.cursor) this.cursor.remove();
    document.body.style.cursor = 'auto';
  }
}

// Singleton instance
let cursorInstance = null;

export function initCustomCursor() {
  if (cursorInstance) {
    cursorInstance.destroy();
  }
  cursorInstance = new CustomCursor();
  cursorInstance.init();
}

export function destroyCustomCursor() {
  if (cursorInstance) {
    cursorInstance.destroy();
    cursorInstance = null;
  }
}

export default CustomCursor;
