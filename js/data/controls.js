// ============================================
// MPK Mini MK3 Playbook - Controls Data
// Hardware control specifications
// ============================================

export const controlsData = [
  {
    id: 'keybed',
    name: 'Keybed',
    icon: 'keybed',
    midiType: 'Note On/Off',
    channel: '1',
    tags: ['Velocity-Sensitive', '25 Keys', 'Synth-Action'],
    description: 'The Gen 2 keybed features synth-action mini keys with improved velocity response. Each key transmits Note On (velocity 1-127) when pressed and Note Off when released.',
    studioTip: 'Use "Wait for Input" in FL Studio to start recording exactly when you play the first note.',
    liveTip: 'Set "Link to Controller" on Channel Volume to key velocity for dynamic organ-style swells (advanced mapping).',
    mechanics: [
      'Travel: Approx 3mm',
      'Action: Spring-loaded synth action',
      'Aftertouch: None',
      'Zones: Octave -4 to +4'
    ],
    midiBehavior: [
      'Transmits Note On (144, Note, Vel)',
      'Transmits Note Off (128, Note, 0) or Note On with Vel 0',
      'Velocity data is exponential (harder press = significantly higher value)'
    ],
    flSpecifics: [
      'Works instantly with "Generic Controller" or dedicated script',
      'Maps to selected Channel Rack instrument',
      'Typing Keyboard to Piano Priority: Low'
    ]
  },
  {
    id: 'pads',
    name: 'MPC Pads',
    icon: 'pads',
    midiType: 'Note On / Aftertouch',
    channel: '10 (Bank A) / 11 (Bank B)',
    tags: ['Pressure-Sensitive', 'Backlit', 'Bankable'],
    description: '8 velocity-sensitive pads derived from flagship MPC series. Capable of transmitting Note, Channel Pressure (Aftertouch), and Program Changes.',
    studioTip: 'Great for FPC drum kits. Bank A maps to Pad 1-8, Bank B maps to Pad 9-16 in FPC default mapping.',
    liveTip: 'Use for clip launching in FL Performance Mode (requires specific channel mapping).',
    mechanics: [
      'Material: Thick rubber composite',
      'Sensors: FSR (Force Sensing Resistor)',
      'Lighting: Red (Bank A), Green (Bank B)',
      'Layout: 2x4 Grid'
    ],
    midiBehavior: [
      'Note On/Off',
      'Channel Pressure (Aftertouch) - usually CC 127 in mono mode',
      'Polyphonic Aftertouch (Not supported on this specific model, uses Channel Pressure)'
    ],
    flSpecifics: [
      'Default mapping aligns with FPC layout perfectly',
      'Can trigger Slicex regions',
      'Use "Omni Preview MIDI channel" to lock pads to drums while keys play synths'
    ]
  },
  {
    id: 'encoders',
    name: 'Endless Encoders',
    icon: 'encoders',
    midiType: 'CC (Control Change)',
    channel: '1',
    tags: ['Eights Knobs', '360° Rotation', 'Assignable'],
    description: '8 assignable endless knobs. MIDI absolute mode by default (0-127). They do not have LED rings to indicate position, so "Pickup" mode in software is recommended.',
    studioTip: 'Enable FL Studio "Pickup" mode (Link dialog > Pickup toggle) to prevent parameter jumps.',
    liveTip: 'Map to Macro controls in Patcher for complex multi-parameter morphing.',
    mechanics: [
      'Type: Endless Rotary Encoder',
      'Resolution: Standard MIDI (0-127)',
      'Detents: None (Smooth)',
      'Acceleration: No'
    ],
    midiBehavior: [
      'Sends CC messages (CC 70-77 by default)',
      'Values clamp at 0 and 127',
      'Does not receive feedback'
    ],
    flSpecifics: [
      'Use "Pickup (takeover)" mode in FL MIDI settings to prevent value jumping',
      'Ideal for Mixer Volume, Pan, or VST Macros',
      'Scripting can change behavior to Relative (increment/decrement)'
    ]
  },
  {
    id: 'joystick',
    name: 'XY Joystick',
    icon: 'joystick',
    midiType: 'Pitch Bend / CC 1',
    channel: '1',
    tags: ['4-Axis', 'Return-to-Center', 'Thumb-Operated'],
    description: 'A thumb-stick controller combining Pitch Bend (X-Axis) and Modulation (Y-Axis). X-axis is spring-loaded to center; Y-axis holds position (on some models) or sprints back.',
    studioTip: 'Link Y-axis to Expression (CC 11) or Cutoff for cinematic swells.',
    liveTip: 'Quick flicks on X-axis for guitar-like vibrato.',
    mechanics: [
      'X-Axis: Pitch Bend (Spring return)',
      'Y-Axis: Modulation CC 1 (Spring return)',
      'Deadzone: Small center deadzone'
    ],
    midiBehavior: [
      'X: 14-bit Pitch Bend message',
      'Y: 7-bit Control Change 1 (Modulation)',
      'Range: 0-16383 (Pitch), 0-127 (Mod)'
    ],
    flSpecifics: [
      'Automatically mapped to Channel Pitch and Mod X/Y',
      'Link to "Fruity X-Y Controller" for vector synthesis control',
      'Can be unlinked and remapped to any parameter'
    ]
  },
  {
    id: 'noterepeat',
    name: 'Note Repeat',
    icon: 'clock',
    midiType: 'MIDI Clock Sync',
    channel: 'All',
    tags: ['Arpeggiator', 'Sync-to-DAW', '1/4 to 1/32T'],
    description: 'Hardware-based note repeat function that retriggers held notes at tempo-synced intervals. Requires MIDI Clock from FL Studio for sync. Works on pads and keys.',
    studioTip: 'Enable "Send Master Sync" in FL Studio MIDI Output settings to sync Note Repeat to project tempo.',
    liveTip: 'Use 1/16T for trap hi-hat rolls. Hold a pad lightly for velocity swells.',
    mechanics: [
      'Toggle button with LED',
      'Division select: 1/4 to 1/32T',
      'Works on pads AND keys simultaneously',
      'Swing adjustable in MPK Editor'
    ],
    midiBehavior: [
      'Retriggers Note On messages at rate',
      'Requires MIDI Clock for sync',
      'Free-running mode available (internal BPM)'
    ],
    flSpecifics: [
      'Combines with Joystick Y → Filter for evolving rolls',
      'Record Note Repeat output as MIDI automation'
    ]
  },
  {
    id: 'arpeggiator',
    name: 'Arpeggiator',
    icon: 'workflows', // Using workflows icon for complex logic
    midiType: 'MIDI Clock Sync',
    channel: 'Keys Channel',
    tags: ['6 Modes', 'Sync-to-DAW', 'Key Hold'],
    description: 'Built-in arpeggiator with 6 modes (Up, Down, Inclusive, Exclusive, Random, Order). Syncs to MIDI Clock or runs free. Latch mode sustains patterns.',
    studioTip: 'Use arp in "Order" mode for the exact sequence you play.',
    liveTip: 'Enable Latch, play a chord, release—arp continues. Free your hands for knob tweaking.',
    mechanics: [
      'Arp button toggles on/off',
      '6 modes selectable via button combo',
      'Latch mode available',
      'Octave range: 1-4'
    ],
    midiBehavior: [
      'Outputs Note On/Off in sequence',
      'Tempo: Synced to MIDI Clock or internal BPM',
      'Swing adjustable in MPK Editor'
    ],
    flSpecifics: [
      'Record arp output to Piano Roll',
      'Use with Sytrus/Harmor for evolving textures'
    ]
  },
  {
    id: 'fulllevel',
    name: 'Full Level',
    icon: 'performance_grid', // Using grid as it relates to pad performance
    midiType: 'N/A (Local)',
    channel: 'N/A',
    tags: ['Velocity Override', 'Max Dynamics', 'Local Function'],
    description: 'Hardware toggle that forces all pad/key hits to maximum velocity (127). No MIDI message sent—purely modifies outgoing velocity data.',
    studioTip: 'Use Full Level for consistent kick and snare tracking.',
    liveTip: 'Quick toggle during performance: Full Level ON for build-ups.',
    mechanics: [
      'Toggle button with LED',
      'Affects pads AND keys',
      'Instant toggle',
      'Survives power cycle'
    ],
    midiBehavior: [
      'Modifies velocity byte to 127',
      'Applies to all notes',
      'Local function only'
    ],
    flSpecifics: [
      'Affects all MIDI pre-transmission'
    ]
  },
  {
    id: 'sustain',
    name: 'Sustain Pedal',
    icon: 'cc', // Using CC icon for pedal
    midiType: 'CC 64',
    channel: 'Global',
    tags: ['Input Jack', 'TS Cable', 'Polarity Sensing'],
    description: '1/4" TS input for a standard sustain pedal. Polarity is detected on startup (plug in BEFORE turning on).',
    studioTip: 'If pedal operates backwards, restart MPK with pedal plugged in.',
    liveTip: 'Can be remapped to "Record" or "Kick Drum" trigger in FL Studio.',
    mechanics: [
      'Connector: 1/4" TS Jack',
      'Operation: Momentary Switch',
      'Polarity: Auto-sensing on boot'
    ],
    midiBehavior: [
      'Transmits CC 64',
      'Value 0 (Off) or 127 (On)',
      'No continuous/half-damper support'
    ],
    flSpecifics: [
      'Recognized immediately as sustain',
      'Records into pattern as automation event'
    ]
  }
];

export default controlsData;
