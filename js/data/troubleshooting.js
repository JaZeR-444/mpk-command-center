// ============================================
// MPK Mini MK3 Playbook - Troubleshooting Data
// Issue matrix with symptoms, causes, and fixes
// ============================================

export const troubleshootingData = [
  {
    id: 'clock-silent',
    symptom: 'Note Repeat / Arp completely silent',
    cause: 'MIDI Clock not being sent from FL Studio to device',
    fix: 'FL Settings (F10) → MIDI → Output → Enable "Send Master Sync" for MPK Mini',
    layer: 'System',
    category: 'clock',
    verification: 'Transport must be running for clock to transmit'
  },
  {
    id: 'clock-drift',
    symptom: 'Note Repeat tempo drifting or unstable',
    cause: 'MPK set to Internal clock instead of External',
    fix: 'MPK Editor → Global → Clock Source → Set to "External"',
    layer: 'System',
    category: 'clock',
    verification: 'OLED should show BPM matching FL Studio project'
  },
  {
    id: 'knob-jump',
    symptom: 'Knob values jump unexpectedly when touched',
    cause: 'Physical knob position doesn\'t match software parameter value',
    fix: 'Enable "Pickup" mode: Right-click parameter → Link → Check "Pickup (takeover mode)"',
    layer: 'Scripting',
    category: 'knob',
    verification: 'Move knob past current value—parameter should "catch up" smoothly'
  },
  {
    id: 'knob-no-response',
    symptom: 'Knobs not responding in FL Studio',
    cause: 'Wrong port assignment or controller not linked',
    fix: 'Verify MIDI Input port in F10 settings, then re-link via Right-click → Link to Controller',
    layer: 'System',
    category: 'knob',
    verification: 'Check MIDI monitor in FL Studio—CCs should appear when moving knobs'
  },
  {
    id: 'pad-wrong-channel',
    symptom: 'Pads triggering wrong instrument / not triggering FPC',
    cause: 'Pad channel mismatch with instrument or Omni Preview setting',
    fix: 'MPK Editor: Set Pads to Channel 10. FL: Set FPC to receive on Channel 10.',
    layer: 'Workflow',
    category: 'pad',
    verification: 'MIDI monitor should show pad notes on Channel 10'
  },
  {
    id: 'pad-velocity',
    symptom: 'Pad hits all same velocity / no dynamics',
    cause: 'Full Level is enabled (forces velocity 127)',
    fix: 'Press Full Level button to toggle off (LED should turn off)',
    layer: 'System',
    category: 'pad',
    verification: 'Hit pads at varying forces—velocity should now vary 1-127'
  },
  {
    id: 'latency-high',
    symptom: 'Noticeable delay between key press and sound',
    cause: 'Audio buffer too high or USB issues',
    fix: 'Lower buffer in FL Audio Settings. Use USB 2.0 port direct to motherboard.',
    layer: 'System',
    category: 'latency',
    verification: 'Target buffer: 256-512 samples for low latency'
  },
  {
    id: 'latency-usb',
    symptom: 'Intermittent latency spikes during long sessions',
    cause: 'USB Selective Suspend power management',
    fix: 'Windows: Power Options → USB Settings → Disable Selective Suspend',
    layer: 'System',
    category: 'latency',
    verification: 'Run session for 30+ minutes—latency should remain stable'
  },
  {
    id: 'connection-dropout',
    symptom: 'MPK randomly disconnecting',
    cause: 'Unpowered USB hub or cable issues',
    fix: 'Connect directly to motherboard USB or use powered hub',
    layer: 'System',
    category: 'port',
    verification: 'Check Device Manager—device should stay connected'
  },
  {
    id: 'oled-dim',
    symptom: 'OLED display dim or flickering',
    cause: 'Insufficient USB power delivery',
    fix: 'Use USB 3.0 port or powered hub. Avoid daisy-chaining with audio interface.',
    layer: 'System',
    category: 'port',
    verification: 'OLED should be bright and stable after power change'
  },
  {
    id: 'device-not-recognized',
    symptom: 'Device shows as "USB Audio Device" or generic',
    cause: 'Missing or outdated Akai drivers / chipset drivers',
    fix: 'Download latest drivers from Akai Pro website. Update motherboard chipset.',
    layer: 'System',
    category: 'port',
    verification: 'Device Manager should show "MPK Mini mk3" specifically'
  },
  {
    id: 'script-not-working',
    symptom: 'FL Studio script features not functioning',
    cause: 'Script not installed or wrong controller type selected',
    fix: 'F10 → MIDI → Controller Type: Select "MPK Mini mk3". Verify script in Settings/Hardware.',
    layer: 'Scripting',
    category: 'knob',
    verification: 'FL should show "MPK Mini mk3" in Scripting section of MIDI Settings'
  },
  {
    id: 'pitch-extreme',
    symptom: 'Joystick pitch bend too extreme / too subtle',
    cause: 'Plugin pitch bend range doesn\'t match MPK setting',
    fix: 'Check plugin settings—standard is ±2 semitones. Adjust in synth or MPK Editor.',
    layer: 'Workflow',
    category: 'knob',
    verification: 'Full joystick X should bend exactly ±2 semitones (or your target)'
  },
  {
    id: 'sustain-reversed',
    symptom: 'Sustain pedal works backwards (pressed = off)',
    cause: 'Polarity detection issue—pedal was pressed during power-on',
    fix: 'Power off MPK, release pedal completely, power back on',
    layer: 'System',
    category: 'port',
    verification: 'Press pedal down—MIDI monitor should show CC 64 value 127'
  },
  {
    id: 'bank-confusion',
    symptom: 'Pads playing unexpected notes after program change',
    cause: 'Bank A/B state doesn\'t match expected mapping',
    fix: 'Check Bank LED (Red = A, Green = B). Press Bank button to toggle.',
    layer: 'Workflow',
    category: 'pad',
    verification: 'Bank A: Notes 36-43. Bank B: Notes 44-51.'
  },
  {
    id: 'cc-conflict',
    symptom: 'Knob affecting wrong parameter or multiple parameters',
    cause: 'CC number conflict with plugin-reserved controllers',
    fix: 'Remap knobs in MPK Editor to avoid CC 1, 7, 10, 11, 64.',
    layer: 'Scripting',
    category: 'knob',
    verification: 'Use CC 70-77 (safe range for general assignment)'
  }
];

export const maintenanceChecklist = [
  {
    title: 'Disable USB Selective Suspend',
    description: 'Prevents Windows from powering down USB ports during idle',
    steps: [
      'Open Power Options in Control Panel',
      'Click "Change plan settings"',
      'Click "Change advanced power settings"',
      'Expand "USB settings" → "USB selective suspend setting"',
      'Set to "Disabled" for both battery and plugged in'
    ]
  },
  {
    title: 'Use Powered USB Hub (if needed)',
    description: 'Ensures consistent 5V power delivery to MPK',
    steps: [
      'Get a USB 3.0 powered hub with independent power supply',
      'Connect MPK directly to hub (not daisy-chained)',
      'Avoid sharing hub with high-power devices (external drives)'
    ]
  },
  {
    title: 'Backup Custom Programs',
    description: 'Export your MPK Editor configurations for safekeeping',
    steps: [
      'Open MPK Editor software',
      'Select your custom program',
      'Click File → Export → Save as .mpk3 file',
      'Store in cloud backup (Dropbox, OneDrive, etc.)'
    ]
  },
  {
    title: 'Regular Driver Updates',
    description: 'Keep Akai and system drivers current',
    steps: [
      'Check Akai Pro website quarterly for MPK firmware/software',
      'Update motherboard chipset drivers annually',
      'Verify FL Studio MIDI device list after major Windows updates'
    ]
  }
];

export default { troubleshootingData, maintenanceChecklist };
