/**
 * MPK Mini Playbook - Pad Audio Demo
 * Web Audio API-based drum/percussion sounds
 */

export class PadAudio {
  constructor() {
    this.audioContext = null;
    this.sounds = new Map();
    this.isInitialized = false;
    
    // Sound configurations for 8 pads
    this.padConfigs = [
      { name: 'kick', freq: 60, decay: 0.5, type: 'sine' },
      { name: 'snare', freq: 200, decay: 0.2, type: 'triangle', noise: true },
      { name: 'hihat', freq: 800, decay: 0.1, type: 'square', noise: true },
      { name: 'tom1', freq: 150, decay: 0.3, type: 'sine' },
      { name: 'tom2', freq: 120, decay: 0.35, type: 'sine' },
      { name: 'clap', freq: 400, decay: 0.15, type: 'triangle', noise: true },
      { name: 'rim', freq: 500, decay: 0.05, type: 'square' },
      { name: 'perc', freq: 300, decay: 0.2, type: 'sine' }
    ];
  }

  init() {
    // Create audio context on user interaction (browser requirement)
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    this.isInitialized = true;
  }

  // Play a pad sound by index (0-7)
  play(padIndex) {
    if (!this.isInitialized) {
      this.init();
    }
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const config = this.padConfigs[padIndex % 8];
    this.synthesize(config);
  }

  synthesize(config) {
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    // Master gain
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(0.5, now);
    masterGain.gain.exponentialDecayTo = (value, time) => {
      masterGain.gain.exponentialRampToValueAtTime(Math.max(value, 0.001), time);
    };

    if (config.noise) {
      // Create noise for snare/hihat/clap
      this.playNoise(masterGain, config.decay, now);
    }

    // Oscillator for tonal component
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = config.type;
    osc.frequency.setValueAtTime(config.freq, now);
    
    // Pitch envelope for kick drum effect
    if (config.name === 'kick') {
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.1);
    }
    
    oscGain.gain.setValueAtTime(0.8, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + config.decay);
    
    osc.connect(oscGain);
    oscGain.connect(masterGain);
    
    osc.start(now);
    osc.stop(now + config.decay + 0.1);
  }

  playNoise(destination, decay, startTime) {
    const ctx = this.audioContext;
    
    // Create noise buffer
    const bufferSize = ctx.sampleRate * decay;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Highpass filter for brighter sound
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 3000;
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, startTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + decay);
    
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(destination);
    
    noise.start(startTime);
    noise.stop(startTime + decay);
  }
}

// Singleton
let padAudio = null;

export function getPadAudio() {
  if (!padAudio) {
    padAudio = new PadAudio();
  }
  return padAudio;
}

// Initialize interactive pads in the DOM
export function initInteractivePads() {
  const pads = document.querySelectorAll('.mini-pad, .interactive-pad');
  const audio = getPadAudio();
  
  pads.forEach((pad, index) => {
    // Click handler
    pad.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.play(index);
      triggerPadVisual(pad);
    });
    
    // Touch handler
    pad.addEventListener('touchstart', (e) => {
      e.preventDefault();
      audio.play(index);
      triggerPadVisual(pad);
    }, { passive: false });
    
    // Keyboard handler (when focused)
    pad.setAttribute('tabindex', '0');
    pad.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        audio.play(index);
        triggerPadVisual(pad);
      }
    });
  });
}

function triggerPadVisual(pad) {
  pad.classList.add('pad-triggered');
  setTimeout(() => {
    pad.classList.remove('pad-triggered');
  }, 150);
}

export default PadAudio;
