// ============================================
// MPK Mini MK3 Playbook - Pages Data
// Page metadata and navigation structure
// ============================================

export const pages = [
  {
    id: 'home',
    title: 'Overview',
    shortTitle: 'Overview',
    path: '/',
    icon: 'home',
    description: 'Transform the MPK Mini into an instrument-grade FL Studio control surface.'
  },
  {
    id: 'architecture',
    title: 'System Architecture',
    shortTitle: 'Architecture',
    path: '/architecture',
    icon: 'architecture',
    description: 'Understanding the multi-layer control system: Physical → Logic → Workflow.'
  },
  {
    id: 'controls',
    title: 'Hardware Controls',
    shortTitle: 'Controls',
    path: '/controls',
    icon: 'keybed', // Using keybed as generic control icon
    description: 'Deep reference for every physical control: mechanical behavior, MIDI output, FL mapping.'
  },
  {
    id: 'programs',
    title: 'Programs & CCs',
    shortTitle: 'Programs',
    path: '/programs',
    icon: 'programs',
    description: 'Banks, Programs, CC namespace design, and avoiding MIDI conflicts.'
  },
  {
    id: 'deployment',
    title: 'FL Studio Deployment',
    shortTitle: 'Deployment',
    path: '/deployment',
    icon: 'deployment',
    description: 'Three-phase deployment strategy with verification gates.'
  },
  {
    id: 'workflows',
    title: 'Advanced Workflows',
    shortTitle: 'Workflows',
    path: '/workflows',
    icon: 'workflows',
    description: 'Performance playbooks: Hi-Hat Engine, Clip Launching, Patcher Super-Macros.'
  },
  {
    id: 'visualizer',
    title: 'Interactive Visualizer',
    shortTitle: 'Visualizer',
    path: '/visualizer',
    icon: 'midi_port', // Using MIDI port icon
    description: 'Real-time MIDI visualization. Verify your connection and see your inputs live.'
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    shortTitle: 'Fix It',
    path: '/troubleshooting',
    icon: 'troubleshooting',
    description: 'Diagnose by layer: clock, ports, mapping, audio buffer.'
  },
  {
    id: 'reference',
    title: 'Reference & Downloads',
    shortTitle: 'Reference',
    path: '/reference',
    icon: 'reference',
    description: 'Assets, glossary, and configuration templates.'
  }
];

export const deploymentPhases = [
  {
    id: 'phase-1',
    number: '01',
    title: 'System Layer',
    description: 'Driver verification and MIDI port configuration',
    steps: [
      {
        title: 'Driver Verification',
        description: 'Ensure device appears as "MPK Mini mk3" in Device Manager (not "USB Audio Device").'
      },
      {
        title: 'MIDI Input Configuration',
        description: 'FL Studio (F10) → MIDI → Input: Enable MPK Mini mk3, assign to Port 10.'
      },
      {
        title: 'MIDI Output Configuration',
        description: 'FL Studio (F10) → MIDI → Output: Enable MPK Mini mk3, assign to Port 10.'
      },
      {
        title: 'Enable Master Sync',
        description: 'In Output settings, enable "Send Master Sync" for OLED display and Note Repeat sync.'
      }
    ],
    verification: [
      'Device shows correct name in Device Manager',
      'MIDI Input indicator flashes when playing MPK',
      'OLED displays BPM matching FL project tempo'
    ]
  },
  {
    id: 'phase-2',
    number: '02',
    title: 'Scripting Layer',
    description: 'Controller script installation and configuration',
    steps: [
      {
        title: 'Script Installation',
        description: 'Verify FL Studio includes MPK Mini mk3 script (built-in since FL 20.8).'
      },
      {
        title: 'Controller Type Selection',
        description: 'F10 → MIDI → Controller Type: Select "MPK Mini mk3" from dropdown.'
      },
      {
        title: 'Script Verification',
        description: 'Knobs should now be focus-aware—behavior changes based on selected window.'
      }
    ],
    verification: [
      'Turn knob with Mixer focused—affects selected mixer track',
      'Turn knob with Channel Rack focused—affects selected channel',
      'Transport controls work (if supported by script version)'
    ]
  },
  {
    id: 'phase-3',
    number: '03',
    title: 'Workflow Layer',
    description: 'Omni Preview and Performance Mode setup',
    steps: [
      {
        title: 'Omni Preview Setup',
        description: 'F10 → MIDI → Input → MPK: Set "Omni Preview Channel" to 10 (matches pad channel).'
      },
      {
        title: 'Performance Mode Setup',
        description: 'Create "Performance" program in MPK Editor with pads on Channel 16.'
      },
      {
        title: 'Enable Performance Mode',
        description: 'Playlist → Performance Mode → Enable. Set Performance Mode Channel to 16 in MIDI settings.'
      }
    ],
    verification: [
      'Pads trigger Channel Rack instruments sequentially in Omni Preview',
      'Switching to "Performance" program on MPK triggers playlist clips',
      'Channels 10 and 16 are isolated—no cross-triggering'
    ]
  }
];

export const workflows = [
  {
    id: 'hihat-engine',
    title: 'Humanized Hi-Hat Engine',
    icon: 'hihat',
    subtitle: 'Expressive trap hi-hat rolls without drawing automation',
    outcome: [
      'Rolling hi-hats synced to tempo',
      'Dynamic velocity swells via joystick',
      'Records as clean MIDI (no automation lanes)'
    ],
    steps: [
      {
        title: 'Load drum kit in FPC',
        description: 'Add FPC to channel rack. Load a hi-hat sample to any pad slot.'
      },
      {
        title: 'Enable Note Repeat on MPK',
        description: 'Press Note Repeat button. Set division to 1/16 or 1/16T for trap feel.'
      },
      {
        title: 'Link Joystick Y to Velocity or Filter',
        description: 'Right-click FPC velocity/filter knob → Link to Controller → Move Joystick Y.'
      },
      {
        title: 'Perform: Hold pad + move joystick',
        description: 'Hold hi-hat pad to roll. Push joystick up for intensity, release for soft.'
      }
    ],
    result: 'Continuous hi-hat rolls with live-controlled dynamics. Record the MIDI output for editing.',
    variations: [
      'Link Joystick Y to filter cutoff for tonal sweeps',
      'Use 1/8T for slower, swung house grooves',
      'Add decay automation via second encoder for open/closed hat'
    ]
  },
  {
    id: 'clip-launching',
    title: 'Performance Mode Clip Launching',
    icon: 'performance_grid',
    subtitle: 'Live arrangement triggering with instant clip launching',
    outcome: [
      'Trigger playlist clips with pads',
      'Build arrangements on-the-fly',
      'Non-destructive live performance'
    ],
    steps: [
      {
        title: 'Create Performance Program',
        description: 'In MPK Editor: Create new program. Set all pads to Channel 16.'
      },
      {
        title: 'Configure FL MIDI Settings',
        description: 'F10 → MIDI → Set Performance Mode Channel to 16.'
      },
      {
        title: 'Enable Performance Mode',
        description: 'Playlist menu → Performance Mode → Enable.'
      },
      {
        title: 'Arrange clips in Playlist',
        description: 'Place clips in "Start" zone rows. Each pad triggers its corresponding row.'
      }
    ],
    result: 'Pads 1-8 trigger clips in the Performance Mode start zone. Switch programs to return to drum triggering.',
    variations: [
      'Set quantize to 1 bar for tight clip switching',
      'Use Bank B for extended 16-clip access',
      'Combine with CC-linked effects for live remixing'
    ]
  },
  {
    id: 'patcher-macro',
    title: 'Patcher Super-Macro',
    icon: 'macro',
    subtitle: 'Single knob controlling multiple parameters with curves',
    outcome: [
      'One encoder controls entire effect chain',
      'Non-linear relationships via formulas',
      'Save as reusable Patcher preset'
    ],
    steps: [
      {
        title: 'Create Patcher preset',
        description: 'Add Patcher to channel. Insert any synth + FX chain inside.'
      },
      {
        title: 'Add Macro Control surface',
        description: 'Right-click Patcher viewport → Add Surface → Select "Knobs" or "XY".'
      },
      {
        title: 'Link macro to multiple targets',
        description: 'Link one macro knob to filter cutoff, reverb wet, and distortion drive simultaneously.'
      },
      {
        title: 'Map encoder to macro',
        description: 'Right-click macro on surface → Link to Controller → Turn MPK encoder.'
      }
    ],
    result: 'Single encoder morphs entire timbre—from clean to destroyed in one twist.',
    variations: [
      'Use Formula Controller for S-curves on specific parameters',
      'Create "intensity" macro: Low = clean, High = full distortion + delay',
      'Add inversion—one param goes up while another goes down'
    ]
  }
];

export const glossary = [
  { term: 'CC (Control Change)', definition: 'MIDI message type for continuous controller data (0-127 range). Used for knobs, faders, and modulation.' },
  { term: 'PC (Program Change)', definition: 'MIDI message that switches presets on receiving device. Range 0-127.' },
  { term: 'MIDI Clock', definition: '24 pulses-per-quarter-note timing reference. Enables tempo sync between devices.' },
  { term: 'Port', definition: 'Virtual MIDI routing channel in FL Studio. Allows multiple devices to coexist without conflict.' },
  { term: 'Pickup Mode', definition: 'Parameter control mode where knob must "pass through" current value before affecting it. Prevents jumps.' },
  { term: 'Omni Preview', definition: 'FL Studio feature allowing pads to trigger Channel Rack instruments sequentially via specific MIDI channel.' },
  { term: 'Performance Mode', definition: 'FL Studio Playlist mode where cells can be triggered live via MIDI, enabling non-linear arrangement.' },
  { term: 'Patcher', definition: 'FL Studio plugin for complex routing, parameter linking, and modular effect/instrument design.' },
  { term: 'Note Repeat', definition: 'Hardware function that retriggers held notes at tempo-synced intervals.' },
  { term: 'Full Level', definition: 'Velocity override mode forcing all pad/key hits to maximum velocity (127).' },
  { term: 'Bank A/B', definition: 'Hardware state toggling pad note numbers. Bank A: 36-43, Bank B: 44-51.' },
  { term: 'Program Select', definition: 'Hardware function to switch between 8 internal configuration presets on the MPK.' }
];

export default { pages, deploymentPhases, workflows, glossary };
