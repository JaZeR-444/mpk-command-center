
// ============================================
// Visualizer Component
// Renders the virtual MPK Mini and handles GSAP animations
// ENHANCED VERSION with all features
// ============================================

import { icons } from './data/icons.js';
import { controlsData } from './data/controls.js';
import midiService from './midi-service.js';

// ============================================
// Chord Detection Constants
// ============================================
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHORD_PATTERNS = {
  // Major chords
  'maj': [0, 4, 7],
  'M': [0, 4, 7],
  // Minor chords
  'min': [0, 3, 7],
  'm': [0, 3, 7],
  // Diminished
  'dim': [0, 3, 6],
  // Augmented
  'aug': [0, 4, 8],
  // 7th chords
  '7': [0, 4, 7, 10],
  'maj7': [0, 4, 7, 11],
  'M7': [0, 4, 7, 11],
  'min7': [0, 3, 7, 10],
  'm7': [0, 3, 7, 10],
  'dim7': [0, 3, 6, 9],
  // Sus chords
  'sus2': [0, 2, 7],
  'sus4': [0, 5, 7],
  // Add chords
  'add9': [0, 4, 7, 14],
  // 9th, 11th, 13th
  '9': [0, 4, 7, 10, 14],
  '11': [0, 4, 7, 10, 14, 17],
  '13': [0, 4, 7, 10, 14, 21],
};

// Keyboard mapping (QWERTY to MIDI notes)
const KEYBOARD_MAP = {
  'KeyA': 48, // C3
  'KeyW': 49, // C#3
  'KeyS': 50, // D3
  'KeyE': 51, // D#3
  'KeyD': 52, // E3
  'KeyF': 53, // F3
  'KeyT': 54, // F#3
  'KeyG': 55, // G3
  'KeyY': 56, // G#3
  'KeyH': 57, // A3
  'KeyU': 58, // A#3
  'KeyJ': 59, // B3
  'KeyK': 60, // C4
  'KeyO': 61, // C#4
  'KeyL': 62, // D4
  'KeyP': 63, // D#4
  'Semicolon': 64, // E4
  'Quote': 65, // F4
};

export class Visualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeNotes = new Set();
    
    // Phase 2: RGB Pad Colors (stored per pad index 0-7)
    this.padColors = JSON.parse(localStorage.getItem('mpk-pad-colors')) || [
      '#ff3d00', '#ff6e40', '#ffab00', '#ffea00',
      '#00e676', '#00bcd4', '#536dfe', '#e040fb'
    ];
    
    // Phase 6: Heatmap tracking
    this.heatmap = JSON.parse(localStorage.getItem('mpk-heatmap')) || {};
    
    // Phase 5: Smart HUD state
    this.hudTimeout = null;
    
    // Phase 9: Recording state
    this.isRecording = false;
    this.recordedEvents = [];
    this.recordingStartTime = 0;
    
    // ══════════════════════════════════════════
    // NEW FEATURES STATE
    // ══════════════════════════════════════════
    
    // Chord Detection
    this.chordTimeout = null;
    this.lastChord = null;
    
    // MIDI Log
    this.midiLogEnabled = false;
    this.midiLogMessages = [];
    this.midiLogStartTime = performance.now();
    
    // Velocity Graph
    this.velocityGraphEnabled = false;
    this.velocityHistory = new Array(60).fill(0);
    
    // Keyboard Input
    this.keyboardInputEnabled = true;
    this.pressedKeys = new Set();
    
    // Color Picker
    this.selectedPadForColor = null;
    
    // Fullscreen
    this.isFullscreen = false;
    
    // Knob values & dragging
    this.knobValues = {};
    this.draggingKnob = null;
    this.dragStartY = 0;
    this.dragStartValue = 0;
    
    // Presets
    this.presets = JSON.parse(localStorage.getItem('mpk-color-presets')) || {
      'Default': ['#ff3d00', '#ff6e40', '#ffab00', '#ffea00', '#00e676', '#00bcd4', '#536dfe', '#e040fb'],
      'Neon': ['#ff00ff', '#00ffff', '#ff00aa', '#00ff88', '#ffff00', '#aa00ff', '#00aaff', '#ff8800'],
      'Fire': ['#ff0000', '#ff3300', '#ff6600', '#ff9900', '#ffcc00', '#ff6600', '#ff3300', '#ff0000'],
      'Ice': ['#00ffff', '#00ccff', '#0099ff', '#0066ff', '#0033ff', '#0066ff', '#0099ff', '#00ccff'],
    };
  }


  async init() {
    this.render();
    
    // Immediate check
    this.showStatus('Checking Permissions...', 'warning');

    try {
        const success = await midiService.init();
        if (success) {
          this.attachListeners();
          
          if (midiService.inputs.length > 0) {
              this.showStatus('Connected: ' + midiService.inputs[0].name, 'success');
              this.updateDeviceSelector();
          } else {
              this.showStatus('Ready (No Device Detected)', 'success');
          }
          
          // Listen for connection changes
          midiService.on('connection-status', (status) => {
              if (status.isConnected) {
                  this.showStatus('Connected: ' + status.port.name, 'success');
              } else {
                  this.showStatus('Device Disconnected', 'warning');
              }
              this.updateDeviceSelector();
          });
          
        } else {
          this.showStatus('MIDI Access Denied', 'error', true);
        }
    } catch (e) {
        console.error("Visualizer Init Error", e);
        this.showStatus('Init Error (Check Console)', 'error');
    }
  }

  render() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="visualizer-stage">
        <!-- Smart HUD Panel (Phase 5) -->
        <div class="smart-hud" id="smart-hud">
          <div class="hud-header">
            <span class="hud-icon"></span>
            <span class="hud-title">Control Info</span>
          </div>
          <div class="hud-body">
            <div class="hud-name">-</div>
            <div class="hud-cc">CC: -</div>
            <div class="hud-tip">-</div>
          </div>
        </div>
        
        <!-- Header Bar -->
        <div class="visualizer-header">
          <div class="viz-status" id="viz-status">
            <span class="status-dot"></span>
            <span class="status-text">Connecting...</span>
          </div>
          
          <!-- Phase 7: Device Selector -->
          <select class="device-selector" id="device-selector">
            <option value="">(Scanning...)</option>
          </select>
          
          <!-- Phase 4: Activity Graph -->
          <canvas id="activity-graph" width="200" height="40"></canvas>
          
          <div class="viz-monitor" id="viz-monitor">Waiting for MIDI...</div>
        </div>
        
        <!-- Controls Row (Record, Heatmap Toggle) -->
        <div class="viz-controls-bar">
          <button class="viz-btn" id="btn-record" title="Record MIDI">⏺ Record</button>
          <button class="viz-btn" id="btn-heatmap" title="Toggle Heatmap">🔥 Heatmap</button>
          <button class="viz-btn" id="btn-midi-log" title="Toggle MIDI Log">📋 Log</button>
          <button class="viz-btn" id="btn-velocity-graph" title="Toggle Velocity Graph">📊 Dynamics</button>
          
          <div class="preset-dropdown">
            <button class="viz-btn" id="btn-presets" title="Color Presets">🎨 Presets</button>
            <div class="preset-menu" id="preset-menu">
              ${Object.entries(this.presets).map(([name, colors]) => `
                <div class="preset-item" data-preset="${name}">
                  <div class="preset-colors">
                    ${colors.slice(0, 4).map(c => `<span class="preset-color-dot" style="background:${c}"></span>`).join('')}
                  </div>
                  <span>${name}</span>
                </div>
              `).join('')}
              <div class="preset-item" id="save-preset-btn">
                <span>💾 Save Current...</span>
              </div>
            </div>
          </div>
          
          <button class="viz-btn" id="btn-fullscreen" title="Toggle Fullscreen">⛶ Fullscreen</button>
          
          <div class="octave-indicator" id="octave-indicator">
            <span class="octave-label">OCT</span>
            <span class="octave-value">0</span>
          </div>
        </div>
        
        <!-- Chord Detection Display -->
        <div class="chord-display" id="chord-display">
          <span class="chord-root">-</span><span class="chord-quality"></span>
          <div class="chord-notes"></div>
        </div>
        
        <!-- Keyboard Input Indicator -->
        <div class="keyboard-input-indicator" id="keyboard-indicator">
          <span class="indicator-dot"></span>
          <span>QWERTY: <span class="key-hint">A</span>-<span class="key-hint">L</span></span>
        </div>
        
        <!-- MIDI Log Panel -->
        <div class="midi-log-panel" id="midi-log-panel">
          <div class="log-header">
            <span>MIDI Log</span>
            <button class="log-clear" id="clear-log">Clear</button>
          </div>
          <div class="log-messages" id="log-messages"></div>
        </div>
        
        <!-- Velocity Graph -->
        <div class="velocity-graph-container" id="velocity-graph-container">
          <div class="velocity-graph-label">Velocity Dynamics</div>
          <canvas id="velocity-graph" width="300" height="60"></canvas>
        </div>
        
        <!-- EXACT WIREFRAME HTML -->
        <div class="mpk-shell">
          <div class="side-cheek"></div>
          <div class="faceplate">
            <div class="upper-layout">
              <!-- Left -->
              <div class="left-block">
                <div class="joy-well" id="ctrl-joystick"><div class="joy-stick" id="stick-cap"></div></div>
                <div class="arp-wrap">
                  <div class="arp-bracket"></div>
                  <span class="arp-text">ARPEGGIATOR</span>
                  <div class="arp-grid">
                    <div class="btn-hw" id="btn-arp-onoff"><div class="btn-print">ON/OFF</div></div>
                    <div class="btn-hw" id="btn-tap-tempo"><div class="btn-print">TAP TEMPO</div></div>
                  </div>
                </div>
                <div class="global-btns">
                  <div class="btn-hw" id="btn-oct-minus"><div class="print-silver">OCT -</div></div>
                  <div class="btn-hw" id="btn-oct-plus"><div class="print-silver">OCT +</div></div>
                  <div class="btn-hw" id="btn-full-level"><div class="print-plain-red">FULL LEVEL</div></div>
                  <div class="btn-hw" id="btn-note-repeat"><div class="print-plain-red">NOTE REPEAT</div></div>
                </div>
              </div>

              <!-- Center Pads -->
              <div class="center-block">
                <div class="pad-row">
                  ${[5,6,7,8].map(num => {
                    const noteMap = { 5: 41, 6: 42, 7: 43, 8: 44 };
                    return `<div class="pad-u">
                      <span class="pad-id">PAD ${num}</span>
                      <div class="pad-phys" data-note="${noteMap[num]}" data-pad-index="${num-1}" style="--pad-color: ${this.padColors[num-1]}"></div>
                    </div>`;
                  }).join('')}
                </div>
                <div class="pad-row row-btm">
                  ${[1,2,3,4].map(num => {
                    const noteMap = { 1: 37, 2: 38, 3: 39, 4: 40 };
                    return `<div class="pad-u">
                      <span class="pad-id" style="color:#eee">PAD ${num}</span>
                      <div class="pad-phys" data-note="${noteMap[num]}" data-pad-index="${num-1}" style="--pad-color: ${this.padColors[num-1]}"></div>
                      <span class="pad-mid-id">PAD ${num}</span>
                    </div>`;
                  }).join('')}
                </div>
              </div>

              <!-- Right Block -->
              <div class="right-block">
                <div class="sys-line">
                  <div class="oled-display" id="oled-display">
                    <div style="color:#fff; font-size:9px; font-weight:900" id="oled-text-1">PAD-1</div>
                    <div style="color:#888; font-size:8px;" id="oled-channel">NOTE#037&nbsp;&nbsp;CH02</div>
                    <div style="color:#fff; font-size:18px; text-align:right; font-weight:900" id="oled-value">127</div>
                  </div>
                  <div class="pad-ctrl-container">
                    <div class="pc-header">PAD CONTROLS</div>
                    <div class="pc-strip">
                      <div class="pc-btn" id="btn-bank"><div class="print-silver">BANK<br>A/B</div></div>
                      <div class="pc-btn" id="btn-cc"><div class="print-silver">CC</div></div>
                      <div class="pc-btn" id="btn-prog-change"><div class="print-silver">PROG<br>CHANGE</div></div>
                      <div class="pc-btn" id="btn-prog-select"><div class="print-silver">PROG<br>SELECT</div></div>
                    </div>
                  </div>
                </div>
                <div class="knob-matrix">
                  ${['DIVISION','SWING','MODE','OCT'].map((label, i) => `
                    <div class="knob-u" data-cc="${70+i}">
                      <span class="knob-id-label">K${i+1}</span>
                      <div class="knob-phys" id="knob-${70+i}"><div class="knob-ptr"></div></div>
                      <span class="knob-pill">${label}</span>
                    </div>
                  `).join('')}
                  ${['LATCH','SYNC','+/-','SWING'].map((label, i) => `
                    <div class="knob-u" data-cc="${74+i}">
                      <span class="knob-id-label">K${i+5}</span>
                      <div class="knob-phys" id="knob-${74+i}"><div class="knob-ptr"></div></div>
                      <span class="knob-pill">${label}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Branding -->
            <div class="brand-strip">
              <span class="brand-akai-bold">AKAI</span><span class="brand-pro-vert">PROFESSIONAL</span>
              <span class="brand-mpk-bold">MPK</span><span class="brand-mini-thin">mini</span>
            </div>

            <!-- Key Labels & Bed -->
            <div class="keybed-wrapper">
              <div class="annotations-bar">
                <span class="key-label l-w1">1/4</span><span class="key-label l-b1">1/4T</span><span class="key-label l-w2">1/8</span><span class="key-label l-b2">1/8T</span><span class="key-label l-w3">1/16</span>
                <span class="key-label l-w4">1/16T</span><span class="key-label l-b3">1/32</span><span class="key-label l-w5">1/32T</span><span class="key-label l-b4">UP</span><span class="key-label l-w6">DOWN</span>
                <span class="key-label l-b5">EXCL</span><span class="key-label l-w7">INCL</span><span class="key-label l-w8">ORDER</span><span class="key-label l-b6">RAND</span><span class="key-label l-w9">LATCH</span>
                <span class="key-label red l-b7">OCT 1</span><span class="key-label red l-w10">OCT 2</span><span class="key-label red l-w11">OCT 3</span><span class="key-label red l-b8">OCT 4</span>
                <span class="key-label l-w12">50%</span><span class="key-label l-b9">55%</span><span class="key-label l-w13">57%</span><span class="key-label l-b10">59%</span><span class="key-label l-w14">61%</span><span class="key-label l-w15">64%</span>
              </div>
              <div class="keys-flex">
                ${[48,50,52,53,55,57,59,60,62,64,65,67,69,71,72].map(note => 
                  `<div class="white-key" data-note="${note}"></div>`
                ).join('')}
                ${[
                  {note: 49, pos: 'pos1'}, {note: 51, pos: 'pos2'}, {note: 54, pos: 'pos3'}, {note: 56, pos: 'pos4'}, {note: 58, pos: 'pos5'},
                  {note: 61, pos: 'pos6'}, {note: 63, pos: 'pos7'}, {note: 66, pos: 'pos8'}, {note: 68, pos: 'pos9'}, {note: 70, pos: 'pos10'}
                ].map(k => `<div class="black-key ${k.pos}" data-note="${k.note}"></div>`).join('')}
              </div>
            </div>
          </div>
          <div class="side-cheek"></div>
        </div>
        
        <!-- Color Picker Overlay -->
        <div class="color-picker-overlay" id="color-picker-overlay">
          <div class="color-picker-modal">
            <div class="picker-header">
              <span class="picker-title">Pad Color</span>
              <button class="picker-close" id="picker-close">×</button>
            </div>
            <div class="picker-preview" id="picker-preview">PAD 1</div>
            <div class="picker-input-row">
              <input type="color" id="pad-color-input" value="#ff3d00">
            </div>
            <div class="color-presets" id="color-presets">
              ${['#ff3d00', '#ff6e40', '#ffab00', '#ffea00', '#00e676', '#00bcd4', '#536dfe', '#e040fb',
                 '#ff00ff', '#00ffff', '#ff0088', '#88ff00', '#ff8800', '#0088ff', '#8800ff', '#ffffff'].map(c => 
                `<button class="color-preset" style="background:${c}" data-color="${c}"></button>`
              ).join('')}
            </div>
            <div class="picker-actions">
              <button id="cancel-color">Cancel</button>
              <button id="apply-color">Apply</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Initial GSAP setup
    gsap.set('.pad-phys', { scale: 1 });
    gsap.set('.white-key, .black-key', { transformOrigin: 'top center' });
    
    // Initialize Activity Graph (Phase 4)
    this.initActivityGraph();
    
    // Initialize control bar listeners
    this.initControlBar();
    
    // ══════════════════════════════════════════
    // NEW FEATURES INITIALIZATION
    // ══════════════════════════════════════════
    this.initVelocityGraph();
    this.initKeyboardInput();
    this.initColorPicker();
    this.initDraggableKnobs();
    this.initPresetMenu();
    this.initFullscreen();
    this.initMIDILog();
  }

  renderKeys() {
    // Wireframe-style keyboard: 15 white keys + 10 black keys, absolute positioned
    // MIDI notes 48 (C3) to 72 (C5)
    const whiteNotes = [48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72];
    const blackNotes = [
      { note: 49, pos: 1 },
      { note: 51, pos: 2 },
      { note: 54, pos: 3 },
      { note: 56, pos: 4 },
      { note: 58, pos: 5 },
      { note: 61, pos: 6 },
      { note: 63, pos: 7 },
      { note: 66, pos: 8 },
      { note: 68, pos: 9 },
      { note: 70, pos: 10 }
    ];
    
    return `
      ${whiteNotes.map(n => `<div class="key-white" data-note="${n}"></div>`).join('')}
      ${blackNotes.map(b => `<div class="key-black pos${b.pos}" data-note="${b.note}"></div>`).join('')}
    `;
  }

  attachListeners() {
    midiService.on('noteOn', (data) => this.animateNote(data.note, data.velocity, true));
    midiService.on('noteOff', (data) => this.animateNote(data.note, 0, false));
    midiService.on('pitchBend', (data) => this.animateJoystick('x', data.value)); // -1.0 to 1.0
    midiService.on('cc', (data) => {
        if (data.cc === 1) this.animateJoystick('y', data.value);
        else this.animateCC(data.cc, data.value);
    });

    // Also attach manual click listeners for testing if no MIDI
    this.container.querySelectorAll('[data-note]').forEach(el => {
        el.addEventListener('mousedown', () => {
            const note = parseInt(el.dataset.note);
            this.animateNote(note, 100, true);
        });
        el.addEventListener('mouseup', () => {
             const note = parseInt(el.dataset.note);
            this.animateNote(note, 0, false);
        });
    });
    
    // Joystick Manual Test
    const stick = document.getElementById('ctrl-joystick');
    if (stick) {
      stick.addEventListener('mousemove', (e) => {
        if (e.buttons !== 1) return;
        const rect = stick.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 2 - 1;
        const y = (e.clientY - rect.top) / rect.height * 2 - 1;
        this.animateJoystick('x', x);
        this.animateJoystick('y', (y + 1) / 2 * 127); // Simulate 0-127 MIDI map
      });
      stick.addEventListener('mouseleave', () => {
        this.animateJoystick('x', 0);
        this.animateJoystick('y', 0); // Center
      });
    }
  }

  animateNote(note, velocity, isOn) {
    // Determine if it's a Pad or Key based on note range or channel
    const elements = document.querySelectorAll(`[data-note="${note}"]`);
    
    // Track active notes for chord detection
    if (isOn) {
      this.activeNotes.add(note);
    } else {
      this.activeNotes.delete(note);
    }
    
    // Phase 4: Push to activity graph
    if (isOn) {
      this.pushActivityValue(velocity);
    }
    
    // NEW: Push to velocity dynamics graph
    if (isOn) {
      this.pushVelocityValue(velocity);
    }
    
    // NEW: Log MIDI
    this.logMIDI(isOn ? 'noteOn' : 'noteOff', { note, velocity });
    
    // NEW: Detect chord
    this.detectChord();
    
    // Phase 6: Track heatmap
    if (isOn) {
      this.trackHeatmap(note);
    }
    
    // Phase 9: Record event
    this.recordEvent(isOn ? 'noteOn' : 'noteOff', { note, velocity });
    
    // Phase 10: Update octave indicator
    if (isOn) {
      this.updateOctaveIndicator(note);
    }
    
    // NEW: Update OLED display
    if (isOn) {
      const isPad = (note >= 36 && note <= 43);
      let padNum = null;
      if (isPad) {
        padNum = note >= 40 ? note - 39 + 4 : note - 35;
      }
      this.updateOLEDDisplay('note', { note, velocity, isPad, padNum });
    }
    
    elements.forEach(el => {
      const isPad = el.classList.contains('pad-phys');
      const isKey = el.classList.contains('white-key') || el.classList.contains('black-key');
      
      // Attempt to identify control for Smart HUD
      let controlId = null;
      if (isPad) {
          if (note >= 44 && note <= 47) controlId = `pad${note - 43 + 4}`;
          if (note >= 36 && note <= 39) controlId = `pad${note - 35}`;
      }
      
      // Phase 5: Show Smart HUD
      if (isOn && controlId) {
        this.showSmartHUD(controlId);
      }
      
      this.updateMonitor(`Note ${isOn ? 'On' : 'Off'}: ${note} (${velocity})`, controlId);

      if (isOn) {
        if (isPad) {
            // Phase 2: Use pad's custom RGB color
            const padColor = el.style.getPropertyValue('--pad-color') || '#ff3d00';
            
            // Phase 3: Velocity-based intensity
            const intensity = 40 + (velocity / 127) * 60; // 40-100% lightness
            
            gsap.to(el, { 
                backgroundColor: padColor,
                boxShadow: `0 0 ${10 + velocity/5}px ${padColor}, inset 0 0 10px rgba(255,255,255,0.3)`,
                scale: 0.95,
                duration: 0.05
            });
            
            // Add lit class for CSS styling
            el.classList.add('lit');
            
            this.spawnParticles(el, velocity);
        }
        if (isKey) {
            // Phase 3: Velocity-based color (cold to hot)
            const hue = 200 - (velocity / 127) * 180; // Blue (200) to Red (20)
            const keyColor = `hsl(${hue}, 100%, ${50 + velocity/5}%)`;
            
            gsap.to(el, { 
                backgroundColor: keyColor,
                rotationX: 5,
                transformOrigin: 'top center',
                duration: 0.05
            });
            
            // Spawn ripple
            this.spawnKeyRipple(el, velocity);
        }
      } else {
        if (isPad) {
            el.classList.remove('lit');
            gsap.to(el, { 
                backgroundColor: '#222', 
                boxShadow: 'none',
                scale: 1,
                duration: 0.2
            });
        }
        if (isKey) {
             gsap.to(el, { 
                backgroundColor: el.classList.contains('black-key') ? '#1a1a1a' : '#ffffff',
                rotationX: 0,
                duration: 0.2
            });
        }
      }
    });
  }
  
  // Phase 3: Ripple effect for keys
  spawnKeyRipple(keyEl, velocity) {
    const ripple = document.createElement('div');
    ripple.className = 'key-ripple';
    keyEl.appendChild(ripple);
    
    const size = 20 + (velocity / 127) * 40;
    gsap.fromTo(ripple, 
      { width: 0, height: 0, opacity: 0.8 },
      { 
        width: size, 
        height: size, 
        opacity: 0, 
        duration: 0.4, 
        ease: 'power2.out',
        onComplete: () => ripple.remove()
      }
    );
  }

  animateCC(cc, value) {
    const knob = document.getElementById(`knob-${cc}`);
    const container = this.container?.querySelector(`[data-cc="${cc}"]`);
    
    if (knob) {
        const rotation = (value / 127 * 270) - 135; // Map 0-127 to -135deg to +135deg
        gsap.to(knob, { rotation: rotation, duration: 0.1 });
        
        // Update knob value display
        if (container) {
          const valueDisplay = container.querySelector('.knob-value');
          if (valueDisplay) valueDisplay.textContent = value;
        }
        
        // Store value
        this.knobValues[cc] = value;
        
        // Find mapped knob ID based on CC (70-77 -> k1-k8)
        let knobId = null;
        let knobNum = null;
        if (cc >= 70 && cc <= 77) {
            knobId = `k${cc - 69}`;
            knobNum = cc - 69;
        }
        
        this.updateMonitor(`CC ${cc}: ${value}`, knobId);
        
        // NEW: Log MIDI
        this.logMIDI('cc', { cc, value });
        
        // NEW: Update OLED display
        this.updateOLEDDisplay('cc', { cc, value, knobNum });
    }
  }

  updateMonitor(text, controlId = null) {
      const el = document.getElementById('viz-monitor');
      if(el) {
          // If we have a detected control ID, look up its metadata
          let extraInfo = '';
          if (controlId) {
             const meta = controlsData.find(c => c.id === controlId);
             if (meta) {
                 extraInfo = `<div style="font-size:0.8em; opacity:0.8; margin-top:4px; color:var(--accent-secondary-bright)">${meta.liveTip || meta.description}</div>`;
             }
          }

          el.innerHTML = `
              <div class="monitor-primary">${text}</div>
              ${extraInfo ? `<div class="monitor-secondary">${extraInfo}</div>` : ''}
          `;
          
          // Flash effect via class to keep styles separated
          el.classList.remove('monitor-flash');
          void el.offsetWidth; // Trigger reflow
          el.classList.add('monitor-flash');
      }
  }

  showStatus(msg, type, isClickable = false) {
    const el = document.getElementById('viz-status');
    if (!el) return;
    
    const dot = el.querySelector('.status-dot');
    const text = el.querySelector('.status-text');
    
    text.textContent = msg;
    dot.className = `status-dot ${type}`; // success, warning, error
    
    if (isClickable) {
        el.style.cursor = 'pointer';
        el.onclick = () => this.init();
    }
  }
  animateJoystick(axis, value) {
     const stick = document.getElementById('stick-cap');
     if (!stick) return;

     // Clamp value
     if (axis === 'y') {
       // CC 1 is 0-127. Visualizer is usually center-return or bottom-zero.
       // MPK joystick Y is Mod, usually 0 at bottom or center depending on mode.
       // Let's assume 0-127 maps to bottom-to-top movement visually (20px range)
       const valNorm = value / 127; 
       const px = (valNorm - 0.5) * -20; // Invert: Up is negative Y
       gsap.to(stick, { y: px, duration: 0.1 });
     } else {
       // Pitch bend is -1 to 1. 20px range.
       const px = value * 20; 
       gsap.to(stick, { x: px, duration: 0.1 });
     }
  }

  spawnParticles(target, velocity) {
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Use pad color if available
    const padColor = target.style.getPropertyValue('--pad-color') || '#ff3d00';
    const colors = [padColor, '#ffffff', '#ffff00'];
    
    for (let i = 0; i < 8; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        p.style.left = centerX + 'px';
        p.style.top = centerY + 'px';
        document.body.appendChild(p);
        
        const angle = Math.random() * Math.PI * 2;
        const dist = 20 + Math.random() * 50 * (velocity/127);
        
        gsap.to(p, {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            opacity: 0,
            scale: 0,
            duration: 0.5 + Math.random() * 0.5,
            ease: "power2.out",
            onComplete: () => p.remove()
        });
    }
  }

  // ============================================
  // Phase 4: Activity Graph
  // ============================================
  initActivityGraph() {
    this.graphCanvas = document.getElementById('activity-graph');
    if (!this.graphCanvas) return;
    
    this.graphCtx = this.graphCanvas.getContext('2d');
    this.activityBuffer = new Array(50).fill(0); // Rolling buffer of 50 bars
    
    // Start animation loop
    this.drawActivityGraph();
  }
  
  drawActivityGraph() {
    if (!this.graphCtx) return;
    
    const ctx = this.graphCtx;
    const w = this.graphCanvas.width;
    const h = this.graphCanvas.height;
    const barWidth = w / this.activityBuffer.length;
    
    ctx.clearRect(0, 0, w, h);
    
    // Draw bars
    this.activityBuffer.forEach((val, i) => {
      const barHeight = (val / 127) * h;
      const hue = 20 + (val / 127) * 30; // Orange to yellow
      ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${0.3 + (val/127) * 0.7})`;
      ctx.fillRect(i * barWidth, h - barHeight, barWidth - 1, barHeight);
    });
    
    // Decay values
    this.activityBuffer = this.activityBuffer.map(v => Math.max(0, v - 2));
    
    requestAnimationFrame(() => this.drawActivityGraph());
  }
  
  pushActivityValue(velocity) {
    this.activityBuffer.shift();
    this.activityBuffer.push(velocity);
  }

  // ============================================
  // Phase 5: Smart HUD
  // ============================================
  showSmartHUD(controlId) {
    const hud = document.getElementById('smart-hud');
    if (!hud) return;
    
    const meta = controlsData.find(c => c.id === controlId);
    if (!meta) {
      hud.classList.remove('visible');
      return;
    }
    
    // Populate HUD
    hud.querySelector('.hud-name').textContent = meta.name || controlId;
    hud.querySelector('.hud-cc').textContent = meta.midiType === 'cc' ? `CC ${meta.cc || '?'}` : `Note ${meta.note || '?'}`;
    hud.querySelector('.hud-tip').textContent = meta.studioTip || meta.liveTip || meta.description || '-';
    
    // Show
    hud.classList.add('visible');
    
    // Auto-hide after 3 seconds
    clearTimeout(this.hudTimeout);
    this.hudTimeout = setTimeout(() => {
      hud.classList.remove('visible');
    }, 3000);
  }

  // ============================================
  // Phase 6: Heatmap
  // ============================================
  trackHeatmap(note) {
    this.heatmap[note] = (this.heatmap[note] || 0) + 1;
    localStorage.setItem('mpk-heatmap', JSON.stringify(this.heatmap));
    
    if (this.heatmapEnabled) {
      this.applyHeatmapOverlay();
    }
  }
  
  applyHeatmapOverlay() {
    const maxHeat = Math.max(1, ...Object.values(this.heatmap));
    
    document.querySelectorAll('[data-note]').forEach(el => {
      const note = el.dataset.note;
      const heat = (this.heatmap[note] || 0) / maxHeat;
      
      if (heat > 0) {
        el.style.setProperty('--heat', heat);
        el.classList.add('has-heat');
      } else {
        el.classList.remove('has-heat');
      }
    });
  }
  
  toggleHeatmap() {
    this.heatmapEnabled = !this.heatmapEnabled;
    
    const btn = document.getElementById('btn-heatmap');
    if (btn) {
      btn.classList.toggle('active', this.heatmapEnabled);
    }
    
    if (this.heatmapEnabled) {
      this.applyHeatmapOverlay();
    } else {
      document.querySelectorAll('.has-heat').forEach(el => {
        el.classList.remove('has-heat');
        el.style.removeProperty('--heat');
      });
    }
  }

  // ============================================
  // Phase 7: Device Selector
  // ============================================
  updateDeviceSelector() {
    const select = document.getElementById('device-selector');
    if (!select) return;
    
    select.innerHTML = '';
    
    if (midiService.inputs.length === 0) {
      select.innerHTML = '<option value="">(No Devices)</option>';
      return;
    }
    
    midiService.inputs.forEach((input, i) => {
      const opt = document.createElement('option');
      opt.value = input.id;
      opt.textContent = input.name;
      opt.selected = i === 0;
      select.appendChild(opt);
    });
    
    // On change, switch input
    select.onchange = (e) => {
      const inputId = e.target.value;
      midiService.selectInput(inputId);
    };
  }

  // ============================================
  // Phase 9: Recording
  // ============================================
  toggleRecording() {
    this.isRecording = !this.isRecording;
    
    const btn = document.getElementById('btn-record');
    if (btn) {
      btn.classList.toggle('recording', this.isRecording);
      btn.textContent = this.isRecording ? '⏹ Stop' : '⏺ Record';
    }
    
    if (this.isRecording) {
      this.recordedEvents = [];
      this.recordingStartTime = performance.now();
    } else if (this.recordedEvents.length > 0) {
      console.log('Recording stopped:', this.recordedEvents.length, 'events');
      // Could save to localStorage or offer download
    }
  }
  
  recordEvent(type, data) {
    if (!this.isRecording) return;
    
    this.recordedEvents.push({
      time: performance.now() - this.recordingStartTime,
      type,
      data
    });
  }
  
  playbackRecording() {
    if (this.recordedEvents.length === 0) {
      console.log('No recording to play');
      return;
    }
    
    this.recordedEvents.forEach(event => {
      setTimeout(() => {
        if (event.type === 'noteOn') {
          this.animateNote(event.data.note, event.data.velocity, true);
        } else if (event.type === 'noteOff') {
          this.animateNote(event.data.note, 0, false);
        } else if (event.type === 'cc') {
          this.animateCC(event.data.cc, event.data.value);
        }
      }, event.time);
    });
  }

  // ============================================
  // Phase 10: Octave Indicator
  // ============================================
  updateOctaveIndicator(note) {
    const indicator = document.getElementById('octave-indicator');
    if (!indicator) return;
    
    // MPK default range is C3 (48) to C5 (72)
    // Octave 0 = notes 48-59, Octave 1 = 60-71, etc.
    const baseOctave = 4; // MIDI note 60 = C4
    const noteOctave = Math.floor(note / 12) - 1;
    const offset = noteOctave - baseOctave;
    
    const valueEl = indicator.querySelector('.octave-value');
    if (valueEl) {
      valueEl.textContent = offset >= 0 ? `+${offset}` : offset;
    }
  }

  // ============================================
  // Control Bar Initialization
  // ============================================
  initControlBar() {
    const recordBtn = document.getElementById('btn-record');
    if (recordBtn) {
      recordBtn.addEventListener('click', () => this.toggleRecording());
    }
    
    const heatmapBtn = document.getElementById('btn-heatmap');
    if (heatmapBtn) {
      heatmapBtn.addEventListener('click', () => this.toggleHeatmap());
    }
    
    // Hardware button simulations
    const bankA = document.getElementById('btn-bank-a');
    const bankB = document.getElementById('btn-bank-b');
    if (bankA && bankB) {
      bankA.addEventListener('click', () => {
        bankA.classList.add('active');
        bankB.classList.remove('active');
      });
      bankB.addEventListener('click', () => {
        bankB.classList.add('active');
        bankA.classList.remove('active');
      });
    }
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                    NEW FEATURES - VELOCITY GRAPH                          ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  
  initVelocityGraph() {
    this.velocityCanvas = document.getElementById('velocity-graph');
    if (!this.velocityCanvas) return;
    
    this.velocityCtx = this.velocityCanvas.getContext('2d');
    
    // Toggle button
    const btn = document.getElementById('btn-velocity-graph');
    if (btn) {
      btn.addEventListener('click', () => this.toggleVelocityGraph());
    }
    
    // Start render loop
    this.drawVelocityGraph();
  }
  
  toggleVelocityGraph() {
    this.velocityGraphEnabled = !this.velocityGraphEnabled;
    
    const container = document.getElementById('velocity-graph-container');
    const btn = document.getElementById('btn-velocity-graph');
    
    if (container) container.classList.toggle('visible', this.velocityGraphEnabled);
    if (btn) btn.classList.toggle('active', this.velocityGraphEnabled);
  }
  
  drawVelocityGraph() {
    if (!this.velocityCtx) return;
    
    const ctx = this.velocityCtx;
    const w = this.velocityCanvas.width;
    const h = this.velocityCanvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    // Draw gradient background line
    const gradient = ctx.createLinearGradient(0, h, 0, 0);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 61, 0, 0.1)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    
    // Draw velocity curve
    ctx.beginPath();
    ctx.moveTo(0, h);
    
    this.velocityHistory.forEach((vel, i) => {
      const x = (i / this.velocityHistory.length) * w;
      const y = h - (vel / 127) * h;
      ctx.lineTo(x, y);
    });
    
    ctx.lineTo(w, h);
    ctx.closePath();
    
    const fillGradient = ctx.createLinearGradient(0, h, 0, 0);
    fillGradient.addColorStop(0, 'rgba(255, 61, 0, 0.2)');
    fillGradient.addColorStop(1, 'rgba(255, 61, 0, 0.6)');
    ctx.fillStyle = fillGradient;
    ctx.fill();
    
    // Draw line on top
    ctx.beginPath();
    ctx.moveTo(0, h - (this.velocityHistory[0] / 127) * h);
    this.velocityHistory.forEach((vel, i) => {
      const x = (i / this.velocityHistory.length) * w;
      const y = h - (vel / 127) * h;
      ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#ff3d00';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    requestAnimationFrame(() => this.drawVelocityGraph());
  }
  
  pushVelocityValue(velocity) {
    this.velocityHistory.shift();
    this.velocityHistory.push(velocity);
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                    NEW FEATURES - KEYBOARD INPUT                          ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  
  initKeyboardInput() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }
  
  handleKeyDown(e) {
    if (!this.keyboardInputEnabled) return;
    if (e.repeat) return; // Ignore key repeat
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    const note = KEYBOARD_MAP[e.code];
    if (note !== undefined && !this.pressedKeys.has(e.code)) {
      this.pressedKeys.add(e.code);
      this.animateNote(note, 100, true);
      
      // Update keyboard indicator
      const indicator = document.getElementById('keyboard-indicator');
      if (indicator) indicator.classList.add('active');
    }
  }
  
  handleKeyUp(e) {
    const note = KEYBOARD_MAP[e.code];
    if (note !== undefined && this.pressedKeys.has(e.code)) {
      this.pressedKeys.delete(e.code);
      this.animateNote(note, 0, false);
      
      // Update keyboard indicator
      if (this.pressedKeys.size === 0) {
        const indicator = document.getElementById('keyboard-indicator');
        if (indicator) indicator.classList.remove('active');
      }
    }
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                    NEW FEATURES - COLOR PICKER                            ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  
  initColorPicker() {
    // Right-click on pad to open color picker
    this.container.querySelectorAll('.pad').forEach(pad => {
      pad.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const padIndex = parseInt(pad.dataset.padIndex);
        this.openColorPicker(padIndex);
      });
      
      // Double-click also works
      pad.addEventListener('dblclick', (e) => {
        e.preventDefault();
        const padIndex = parseInt(pad.dataset.padIndex);
        this.openColorPicker(padIndex);
      });
    });
    
    // Close button
    const closeBtn = document.getElementById('picker-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeColorPicker());
    
    // Cancel button
    const cancelBtn = document.getElementById('cancel-color');
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeColorPicker());
    
    // Apply button
    const applyBtn = document.getElementById('apply-color');
    if (applyBtn) applyBtn.addEventListener('click', () => this.applyPadColor());
    
    // Color input change
    const colorInput = document.getElementById('pad-color-input');
    if (colorInput) {
      colorInput.addEventListener('input', (e) => {
        this.updatePickerPreview(e.target.value);
      });
    }
    
    // Color presets
    this.container.querySelectorAll('.color-preset').forEach(preset => {
      preset.addEventListener('click', () => {
        const color = preset.dataset.color;
        const colorInput = document.getElementById('pad-color-input');
        if (colorInput) colorInput.value = color;
        this.updatePickerPreview(color);
      });
    });
    
    // Click overlay to close
    const overlay = document.getElementById('color-picker-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeColorPicker();
      });
    }
  }
  
  openColorPicker(padIndex) {
    this.selectedPadForColor = padIndex;
    const overlay = document.getElementById('color-picker-overlay');
    const preview = document.getElementById('picker-preview');
    const colorInput = document.getElementById('pad-color-input');
    
    if (overlay) overlay.classList.add('visible');
    if (preview) {
      preview.textContent = `PAD ${padIndex + 1}`;
      preview.style.background = this.padColors[padIndex];
    }
    if (colorInput) colorInput.value = this.padColors[padIndex];
  }
  
  closeColorPicker() {
    const overlay = document.getElementById('color-picker-overlay');
    if (overlay) overlay.classList.remove('visible');
    this.selectedPadForColor = null;
  }
  
  updatePickerPreview(color) {
    const preview = document.getElementById('picker-preview');
    if (preview) preview.style.background = color;
  }
  
  applyPadColor() {
    if (this.selectedPadForColor === null) return;
    
    const colorInput = document.getElementById('pad-color-input');
    if (!colorInput) return;
    
    const newColor = colorInput.value;
    this.padColors[this.selectedPadForColor] = newColor;
    
    // Update pad element
    const pad = this.container.querySelector(`[data-pad-index="${this.selectedPadForColor}"]`);
    if (pad) {
      pad.style.setProperty('--pad-color', newColor);
    }
    
    // Save to localStorage
    localStorage.setItem('mpk-pad-colors', JSON.stringify(this.padColors));
    
    this.closeColorPicker();
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                    NEW FEATURES - DRAGGABLE KNOBS                         ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  
  initDraggableKnobs() {
    // Initialize knob values
    [70, 71, 72, 73, 74, 75, 76, 77].forEach(cc => {
      this.knobValues[cc] = 64; // Center value
    });
    
    this.container.querySelectorAll('.knob-container').forEach(container => {
      const cc = parseInt(container.dataset.cc);
      const knobCap = container.querySelector('.knob-cap');
      
      knobCap.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.draggingKnob = cc;
        this.dragStartY = e.clientY;
        this.dragStartValue = this.knobValues[cc] || 64;
        container.classList.add('active');
        
        document.addEventListener('mousemove', this.handleKnobDrag);
        document.addEventListener('mouseup', this.handleKnobRelease);
      });
    });
    
    // Bind methods
    this.handleKnobDrag = this.handleKnobDrag.bind(this);
    this.handleKnobRelease = this.handleKnobRelease.bind(this);
  }
  
  handleKnobDrag(e) {
    if (this.draggingKnob === null) return;
    
    const deltaY = this.dragStartY - e.clientY;
    const sensitivity = 1; // 1 unit per pixel
    let newValue = this.dragStartValue + (deltaY * sensitivity);
    
    // Clamp 0-127
    newValue = Math.max(0, Math.min(127, Math.round(newValue)));
    
    this.knobValues[this.draggingKnob] = newValue;
    this.animateCC(this.draggingKnob, newValue);
  }
  
  handleKnobRelease() {
    if (this.draggingKnob !== null) {
      const container = this.container.querySelector(`[data-cc="${this.draggingKnob}"]`);
      if (container) container.classList.remove('active');
    }
    
    this.draggingKnob = null;
    document.removeEventListener('mousemove', this.handleKnobDrag);
    document.removeEventListener('mouseup', this.handleKnobRelease);
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                    NEW FEATURES - PRESET MENU                             ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  
  initPresetMenu() {
    // Preset items
    this.container.querySelectorAll('.preset-item[data-preset]').forEach(item => {
      item.addEventListener('click', () => {
        const presetName = item.dataset.preset;
        this.loadPreset(presetName);
      });
    });
    
    // Save preset button
    const saveBtn = document.getElementById('save-preset-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveCurrentPreset());
    }
  }
  
  loadPreset(presetName) {
    const preset = this.presets[presetName];
    if (!preset) return;
    
    this.padColors = [...preset];
    
    // Update all pad elements
    this.container.querySelectorAll('.pad').forEach(pad => {
      const index = parseInt(pad.dataset.padIndex);
      pad.style.setProperty('--pad-color', this.padColors[index]);
    });
    
    // Save to localStorage
    localStorage.setItem('mpk-pad-colors', JSON.stringify(this.padColors));
    
    // Flash feedback
    this.showStatus(`Loaded preset: ${presetName}`, 'success');
  }
  
  saveCurrentPreset() {
    const name = prompt('Enter preset name:', 'My Preset');
    if (!name) return;
    
    this.presets[name] = [...this.padColors];
    localStorage.setItem('mpk-color-presets', JSON.stringify(this.presets));
    
    // Re-render would be needed to update the menu, or do dynamically
    this.showStatus(`Saved preset: ${name}`, 'success');
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                    NEW FEATURES - FULLSCREEN                              ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  
  initFullscreen() {
    const btn = document.getElementById('btn-fullscreen');
    if (btn) {
      btn.addEventListener('click', () => this.toggleFullscreen());
    }
    
    // ESC key exits fullscreen
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isFullscreen) {
        this.toggleFullscreen();
      }
    });
  }
  
  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    
    const stage = this.container.querySelector('.visualizer-stage');
    const btn = document.getElementById('btn-fullscreen');
    
    if (stage) stage.classList.toggle('fullscreen', this.isFullscreen);
    if (btn) {
      btn.classList.toggle('active', this.isFullscreen);
      btn.textContent = this.isFullscreen ? '⛶ Exit' : '⛶ Fullscreen';
    }
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                    NEW FEATURES - MIDI LOG                                ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  
  initMIDILog() {
    const btn = document.getElementById('btn-midi-log');
    if (btn) {
      btn.addEventListener('click', () => this.toggleMIDILog());
    }
    
    const clearBtn = document.getElementById('clear-log');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearMIDILog());
    }
  }
  
  toggleMIDILog() {
    this.midiLogEnabled = !this.midiLogEnabled;
    
    const panel = document.getElementById('midi-log-panel');
    const btn = document.getElementById('btn-midi-log');
    
    if (panel) panel.classList.toggle('visible', this.midiLogEnabled);
    if (btn) btn.classList.toggle('active', this.midiLogEnabled);
  }
  
  clearMIDILog() {
    this.midiLogMessages = [];
    this.midiLogStartTime = performance.now();
    const container = document.getElementById('log-messages');
    if (container) container.innerHTML = '';
  }
  
  logMIDI(type, data) {
    if (!this.midiLogEnabled) return;
    
    const time = ((performance.now() - this.midiLogStartTime) / 1000).toFixed(2);
    const container = document.getElementById('log-messages');
    if (!container) return;
    
    let className = '';
    let message = '';
    
    switch (type) {
      case 'noteOn':
        className = 'note-on';
        message = `Note ${data.note} Vel ${data.velocity}`;
        break;
      case 'noteOff':
        className = 'note-off';
        message = `Note ${data.note} Off`;
        break;
      case 'cc':
        className = 'cc';
        message = `CC ${data.cc} Val ${data.value}`;
        break;
      case 'pitchBend':
        className = 'pitch';
        message = `Pitch ${data.value.toFixed(2)}`;
        break;
    }
    
    const entry = document.createElement('div');
    entry.className = `log-entry ${className}`;
    entry.innerHTML = `
      <span class="log-time">${time}s</span>
      <span class="log-type">${type}</span>
      <span class="log-data">${message}</span>
    `;
    
    container.appendChild(entry);
    container.scrollTop = container.scrollHeight;
    
    // Limit to 100 entries
    while (container.children.length > 100) {
      container.removeChild(container.firstChild);
    }
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                    NEW FEATURES - CHORD DETECTION                         ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  
  detectChord() {
    if (this.activeNotes.size < 2) {
      this.hideChordDisplay();
      return;
    }
    
    const notes = Array.from(this.activeNotes).sort((a, b) => a - b);
    const bassNote = notes[0];
    const bassNoteName = NOTE_NAMES[bassNote % 12];
    
    // Normalize to intervals from bass
    const intervals = notes.map(n => (n - bassNote) % 12).sort((a, b) => a - b);
    const uniqueIntervals = [...new Set(intervals)];
    
    // Try to match chord patterns
    let matchedChord = null;
    let matchedQuality = '';
    
    for (const [quality, pattern] of Object.entries(CHORD_PATTERNS)) {
      if (this.arraysMatch(uniqueIntervals, pattern)) {
        matchedChord = bassNoteName;
        matchedQuality = quality;
        break;
      }
    }
    
    // If no exact match, try partial match for triads
    if (!matchedChord && uniqueIntervals.length >= 3) {
      const triad = uniqueIntervals.slice(0, 3);
      for (const [quality, pattern] of Object.entries(CHORD_PATTERNS)) {
        if (pattern.length === 3 && this.arraysMatch(triad, pattern)) {
          matchedChord = bassNoteName;
          matchedQuality = quality;
          break;
        }
      }
    }
    
    if (matchedChord) {
      this.showChordDisplay(matchedChord, matchedQuality, notes);
    } else {
      // Show as note cluster
      const noteNames = notes.map(n => NOTE_NAMES[n % 12]).join(' ');
      this.showChordDisplay('', '', notes, noteNames);
    }
  }
  
  arraysMatch(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }
  
  showChordDisplay(root, quality, notes, fallbackText = null) {
    const display = document.getElementById('chord-display');
    if (!display) return;
    
    const rootEl = display.querySelector('.chord-root');
    const qualityEl = display.querySelector('.chord-quality');
    const notesEl = display.querySelector('.chord-notes');
    
    if (fallbackText) {
      if (rootEl) rootEl.textContent = fallbackText;
      if (qualityEl) qualityEl.textContent = '';
    } else {
      if (rootEl) rootEl.textContent = root;
      if (qualityEl) qualityEl.textContent = quality;
    }
    
    if (notesEl) {
      notesEl.textContent = notes.map(n => NOTE_NAMES[n % 12] + Math.floor(n / 12 - 1)).join(' · ');
    }
    
    display.classList.add('visible');
    display.classList.remove('hidden');
    
    // Auto-hide after chord change timeout
    clearTimeout(this.chordTimeout);
    this.chordTimeout = setTimeout(() => {
      if (this.activeNotes.size < 2) {
        this.hideChordDisplay();
      }
    }, 2000);
  }
  
  hideChordDisplay() {
    const display = document.getElementById('chord-display');
    if (display) {
      display.classList.remove('visible');
      display.classList.add('hidden');
    }
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                    NEW FEATURES - OLED DISPLAY UPDATE                     ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  
  updateOLEDDisplay(type, data) {
    const oled = document.getElementById('oled-screen');
    if (!oled) return;
    
    const line1 = oled.querySelector('.oled-line1');
    const line2 = oled.querySelector('.oled-line2');
    const value = oled.querySelector('.oled-value');
    
    oled.classList.add('flash');
    setTimeout(() => oled.classList.remove('flash'), 200);
    
    switch (type) {
      case 'note':
        const noteName = NOTE_NAMES[data.note % 12];
        const octave = Math.floor(data.note / 12) - 1;
        if (line1) line1.textContent = data.isPad ? `PAD-${data.padNum}` : `${noteName}${octave}`;
        if (line2) line2.innerHTML = `NOTE#${String(data.note).padStart(3, '0')} <span class="oled-channel">CH01</span>`;
        if (value) value.textContent = data.velocity;
        break;
        
      case 'cc':
        if (line1) line1.textContent = `K${data.knobNum}`;
        if (line2) line2.innerHTML = `CC#${String(data.cc).padStart(3, '0')} <span class="oled-channel">CH01</span>`;
        if (value) value.textContent = data.value;
        break;
        
      case 'pitch':
        if (line1) line1.textContent = 'PITCH';
        if (line2) line2.textContent = 'BEND';
        if (value) value.textContent = Math.round(data.value * 100);
        break;
    }
  }
}

export default Visualizer;

