
// ============================================
// MIDI Service
// Handles WebMIDI API connection and event parsing
// ============================================

export class MIDIService {
  constructor() {
    this.midiAccess = null;
    this.inputs = [];
    this.outputs = [];
    this.listeners = [];
    this.debug = true;
    this.activeInput = null; // Currently selected input
  }

  async init() {
    if (!navigator.requestMIDIAccess) {
      console.error('WebMIDI is not supported in this browser.');
      return false;
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      this.updatePorts();
      
      this.midiAccess.onstatechange = (e) => {
        console.log(`MIDI State Change: ${e.port.name} (${e.port.state})`);
        this.updatePorts();
        this.emit('connection-status', { 
          port: e.port, 
          isConnected: e.port.state === 'connected' 
        });
      };
      
      return true;
    } catch (err) {
      console.error('MIDI Access Failed:', err);
      return false;
    }
  }

  updatePorts() {
    this.inputs = Array.from(this.midiAccess.inputs.values());
    this.outputs = Array.from(this.midiAccess.outputs.values());
    
    console.log('🔌 updatePorts called. Found inputs:', this.inputs.map(i => `${i.name} (${i.id})`));
    console.log('🔌 Current activeInput:', this.activeInput?.name || 'none');
    
    // If no active input, select first one automatically
    if (!this.activeInput && this.inputs.length > 0) {
      console.log('🔌 Auto-selecting first available MIDI input:', this.inputs[0].name);
      this.selectInput(this.inputs[0].id);
    } else if (this.activeInput && !this.inputs.find(i => i.id === this.activeInput.id)) {
      console.warn('🔌 Active input lost. Resetting selection.');
      this.activeInput = null;
      if (this.inputs.length > 0) {
        this.selectInput(this.inputs[0].id);
      }
    }

    console.log('MIDI Inputs:', this.inputs.map(i => i.name));
  }
  
  // Phase 7: Select a specific input by ID
  selectInput(inputId) {
    console.log('🎛️ selectInput called with ID:', inputId);
    
    // Detach from current input
    if (this.activeInput) {
      console.log('🎛️ Detaching from current input:', this.activeInput.name);
      this.activeInput.onmidimessage = null;
    }
    
    // Find and attach to new input
    const input = this.inputs.find(i => i.id === inputId);
    if (input) {
      console.log('🎛️ Found input:', input.name, '- Attaching handler...');
      input.onmidimessage = this.handleMIDIMessage.bind(this);
      this.activeInput = input;
      console.log('✅ Handler attached! onmidimessage:', typeof input.onmidimessage === 'function');
      console.log('Selected MIDI Input:', input.name);
      this.emit('inputChanged', { input });
    } else {
      console.error('❌ Could not find input with ID:', inputId);
    }
  }

  handleMIDIMessage(message) {
    // DEBUG: Always log raw MIDI data to see if messages arrive
    console.log('🎹 MIDI RAW:', Array.from(message.data));
    
    const [status, data1, data2] = message.data;
    const command = status & 0xF0; // Mask channel
    const channel = (status & 0x0F) + 1;
    let type = '';
    
    // Parse Standard Messages
    switch (command) {
      case 144: // Note On
        if (data2 > 0) type = 'noteOn';
        else type = 'noteOff'; // Some devices send Note On Vel 0 as Off
        break;
      case 128: // Note Off
        type = 'noteOff';
        break;
      case 176: // Control Change (CC)
        type = 'cc';
        break;
      case 224: // Pitch Bend
        type = 'pitchBend';
        break;
      case 248: // Timing Clock (Ignore log spam)
        return; 
      case 254: // Active Sensing (Ignore log spam)
        return; 
      default:
        type = 'unknown';
    }

    // Calculate Pitch Bend Value (-1.0 to 1.0)
    let bendValue = 0;
    if (type === 'pitchBend') {
        const lsb = data1;
        const msb = data2;
        const rawBend = (msb << 7) + lsb; // 14-bit value (0-16383)
        // Center is 8192. Normalize to -1.0 to 1.0
        bendValue = (rawBend - 8192) / 8192;
    }

    const eventData = {
      type,
      channel,
      note: type.startsWith('note') ? data1 : null,
      velocity: type.startsWith('note') ? data2 : null,
      cc: type === 'cc' ? data1 : null,
      value: type === 'cc' ? data2 : (type === 'pitchBend' ? bendValue : null),
      raw: message.data
    };

    if (this.debug && type !== 'unknown') {
      console.log(`🎹 MIDI Event: [Ch${channel}] ${type}`, eventData);
    }

    this.emit(type, eventData);
    this.emit('message', eventData); // Catch-all
  }

  // Simple Event Emitter Implementation
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}

export const midiService = new MIDIService();
export default midiService;
