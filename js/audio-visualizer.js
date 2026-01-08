/**
 * MPK Mini Playbook - Audio Visualizer
 * Canvas-based waveform animation for hero background
 */

export class AudioVisualizer {
  constructor(containerId = 'audio-visualizer') {
    this.containerId = containerId;
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    this.isRunning = false;
    this.time = 0;
    
    // Configuration
    this.config = {
      waveCount: 3,
      baseAmplitude: 30,
      frequency: 0.02,
      speed: 0.03,
      colors: [
        'rgba(255, 61, 0, 0.15)',   // Akai orange
        'rgba(139, 92, 246, 0.1)',  // FL Purple
        'rgba(255, 255, 255, 0.05)' // White
      ],
      lineWidth: 2
    };
  }

  init() {
    // Check reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.createCanvas();
    this.resize();
    this.start();

    window.addEventListener('resize', () => this.resize());
  }

  createCanvas() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    this.canvas = document.createElement('canvas');
    this.canvas.id = this.containerId;
    this.canvas.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      opacity: 0.6;
    `;
    
    hero.insertBefore(this.canvas, hero.firstChild);
    this.ctx = this.canvas.getContext('2d');
  }

  resize() {
    if (!this.canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    this.width = rect.width;
    this.height = rect.height;
  }

  drawWave(index) {
    const { ctx, width, height, time, config } = this;
    const color = config.colors[index % config.colors.length];
    const amplitude = config.baseAmplitude * (1 - index * 0.2);
    const yOffset = height * 0.5 + (index - 1) * 40;
    const phaseOffset = index * Math.PI * 0.3;
    
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = config.lineWidth;
    
    for (let x = 0; x <= width; x += 3) {
      // Multiple sine waves combined
      const y = yOffset + 
        Math.sin(x * config.frequency + time + phaseOffset) * amplitude +
        Math.sin(x * config.frequency * 2 + time * 1.5) * (amplitude * 0.3) +
        Math.sin(x * config.frequency * 0.5 + time * 0.7) * (amplitude * 0.5);
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Add glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  draw() {
    if (!this.ctx) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw each wave
    for (let i = 0; i < this.config.waveCount; i++) {
      this.drawWave(i);
    }
    
    // Update time
    this.time += this.config.speed;
  }

  animate() {
    if (!this.isRunning) return;
    this.draw();
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
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }
  }
}

// Singleton
let visualizer = null;

export function initAudioVisualizer() {
  if (visualizer) {
    visualizer.destroy();
  }
  visualizer = new AudioVisualizer();
  visualizer.init();
}

export function destroyAudioVisualizer() {
  if (visualizer) {
    visualizer.destroy();
    visualizer = null;
  }
}

export default AudioVisualizer;
