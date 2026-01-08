<div align="center">

  <img src="MIDI FAVICON LOGO.svg" alt="MPK Command Center Logo" width="140" height="140" />

# MPK Command Center

### FL Studio × AKAI MPK Mini MK3 Integration Platform

**A production-grade web application providing real-time visualization, intelligent deployment protocols, and advanced workflow strategies for professional music production.**

<p align="center">
  <a href="https://jazer-444.github.io/mpk-command-center/">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-Try_It_Now-00f2ff?style=for-the-badge" alt="Live Demo" />
  </a>
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2026.1.0-blue.svg)](https://semver.org)
[![Tech Stack](https://img.shields.io/badge/stack-Vanilla_JS_+_WebMIDI-F7DF1E.svg?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Design](https://img.shields.io/badge/design-Glass_Mainframe_UI-00f2ff.svg)](https://css-tricks.com/)
[![Animation](https://img.shields.io/badge/powered_by-GSAP_3-88CE02.svg)](https://greensock.com/gsap/)

  <p align="center">
    <a href="#-overview">Overview</a> •
    <a href="#-features">Features</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-architecture">Architecture</a> •
    <a href="#-technology">Technology</a> •
    <a href="#-roadmap">Roadmap</a>
  </p>

</div>

<div align="center">
  <img src="MPK-MINI-RED-AND-BLACK.jpg" alt="AKAI MPK Mini MK3" width="100%" style="border-radius: 12px; margin: 20px 0;" />
</div>

---

## 🎯 Overview

The **MPK Command Center** is a browser-based control interface that transforms the AKAI MPK Mini MK3 into a fully-integrated FL Studio production tool. Unlike static PDF manuals, this is an **interactive, real-time companion** that provides hardware visualization, context-aware configuration guidance, and professional troubleshooting workflows.

### Why This Exists

**The Problem:** Hardware MIDI controllers ship with generic configurations that cause conflicts, confusion, and productivity loss when integrating with modern DAWs. Users spend hours troubleshooting MIDI channels, CC conflicts, and clock synchronization issues.

**The Solution:** A centralized, intelligent platform that provides:
- **Real-time hardware feedback** via WebMIDI API
- **Verified, conflict-free configurations** based on FL Studio architecture
- **Interactive troubleshooting** with layer-based diagnostics
- **Workflow automation guides** for studio and live performance scenarios

> _"The missing control surface for your control surface."_

---

## ✨ Features

### 🎹 Real-Time Hardware Visualizer

Professional-grade MIDI monitoring with visual hardware simulation.

- **1:1 Hardware Representation**: Virtual controller that mirrors your physical MPK Mini MK3
- **Live Input Feedback**: Pads illuminate, knobs rotate, and keys respond in real-time
- **Matrix Console**: Scrolling event log with MIDI message parsing (Note On/Off, CC, Pitch Bend, Program Change)
- **Connection Status**: Automatic device detection with connection health monitoring
- **Zero Latency**: Direct WebMIDI integration bypassing driver layers

### 📐 Three-Layer System Architecture

Deep-dive into the MPK Mini's signal flow for precision configuration.

- **Physical Layer**: Hardware configuration via MPK Editor (velocity curves, CC assignments, program banks)
- **Logic Layer**: FL Studio MIDI routing, port management, and Python scripting integration
- **Workflow Layer**: Performance modes, Omni Preview, Patcher routing strategies
- **Signal Flow Diagrams**: Visual representations of input/output pipelines
- **Channel Strategy Guide**: Prevent MIDI collisions with structured channel allocation

### 🛠️ Hardware Controls Encyclopedia

Comprehensive reference for every physical control element.

- **Mechanical Specifications**: Keybed action, pad sensitivity, encoder resolution details
- **MIDI Behavior Documentation**: Default mappings, velocity ranges, CC number assignments
- **FL Studio Integration Tips**: Context-aware suggestions for Studio vs Live performance modes
- **Mode Toggle**: Switch between production-focused and performance-focused recommendations
- **Interactive Navigation**: Searchable control library with instant detail views

### 📦 Program & Bank Management

Master the MPK's 8 onboard program slots for rapid workflow switching.

- **Factory vs Custom Analysis**: Why default presets fail in FL Studio
- **Optimized FL Studio Program**: Verified configuration avoiding CC conflicts
- **Program Select vs Program Change**: Clear distinction between hardware state and MIDI messages
- **CC Namespace Design**: Safe CC ranges (70-77) avoiding Volume/Pan/Expression conflicts
- **Copy-to-Clipboard Configs**: One-click configuration templates for MPK Editor

### 🚀 Interactive Deployment Protocol

Three-phase setup system with verification gates.

- **Phase 1 - System**: MIDI port configuration, driver verification, hardware connectivity
- **Phase 2 - Scripts**: FL Studio scripting integration, controller linking, Python setup
- **Phase 3 - Workflow**: Omni Preview, Performance Mode, advanced routing techniques
- **Persistent Progress**: LocalStorage-backed checklist that survives browser sessions
- **Expandable Sections**: Accordion-style phase navigation with completion tracking

### 🎭 Advanced Workflow Library

Production-ready techniques for studio and stage.

- **Knob-to-Mixer Automation**: Real-time volume control with recording strategies
- **Omni Preview Sequential Triggering**: Pad-based sample audition workflows
- **Performance Mode Clip Launching**: Scene-based arrangement automation
- **Filter Sweep Recording**: Gesture-based parameter automation techniques
- **Patcher Multi-Instrument Routing**: Complex signal splitting and layering strategies

### 🔍 Command Palette Search

VSCode-style global search for instant navigation.

- **Keyboard Shortcut**: `Ctrl+K` (or `Cmd+K` on macOS) from anywhere
- **Multi-Source Search**: Pages, hardware controls, troubleshooting entries, glossary terms
- **Fuzzy Matching**: Find results even with typos or partial queries
- **Live Results**: Real-time filtering as you type
- **Keyboard Navigation**: Arrow keys + Enter for hands-off operation

### 🔧 Intelligent Troubleshooting Matrix

Layer-based diagnostics with surgical precision.

- **Symptom → Cause → Fix Pipeline**: Structured problem-solving approach
- **Layer Attribution**: Issues tagged as System/Scripting/Workflow for targeted debugging
- **Category Filtering**: Clock, Knob, Pad, Port, Latency-specific problem sets
- **Verification Steps**: Post-fix confirmation procedures for each issue
- **Live Search**: Filter troubleshooting database by keywords

### 📚 MIDI Reference Library

Technical specifications and configuration assets.

- **CC Namespace Map**: Visual knob assignment guide with conflict avoidance
- **Script Installation Paths**: Windows and macOS FL Studio settings directories
- **Downloadable Templates**: CC maps, setup checklists, program backups
- **Interactive Glossary**: Searchable definitions for MIDI/DAW terminology
- **Changelog**: Version history and feature tracking

### 🎨 Glass Mainframe Design System

Cyberpunk-inspired, production-grade UI.

- **Glassmorphism**: CSS `backdrop-filter` with 12px blur for depth perception
- **Bento Grid Layout**: High-density information architecture inspired by Apple
- **GSAP 3 Animations**: Physics-based micro-interactions, scroll triggers, parallax effects
- **Custom Cursor**: Hardware-themed cursor with interactive hover states
- **Responsive Design**: Desktop-first with mobile gesture support
- **Dark/Light Theme**: System-aware theme switching with localStorage persistence
- **Scroll Progress Indicator**: Visual reading progress with smooth animations

---

## 🚀 Quick Start

### System Requirements

- **Browser**: Chrome 87+, Edge 87+, or Opera 74+ (WebMIDI API support required)
- **Hardware**: AKAI MPK Mini MK3 connected via USB
- **DAW**: FL Studio 20.8+ (for full integration)
- **Operating System**: Windows 10+, macOS 10.15+, or Linux with ALSA MIDI

### Installation

**Option 1: Local Deployment** (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/mpk-command-center.git
cd mpk-command-center

# Serve with Python (built-in HTTP server)
python -m http.server 8080

# OR serve with Node.js
npx http-server -p 8080

# Open browser to http://localhost:8080
```

**Option 2: Direct Launch** (No installation)

Simply open `index.html` in a supported browser. Note: Some features may require a local server context due to ES6 module restrictions.

### First Launch Checklist

1. **Connect Hardware**
   - Plug MPK Mini MK3 into USB port
   - Wait for driver recognition (Windows/macOS will auto-install)

2. **Grant MIDI Access**
   - Browser will prompt for MIDI device permissions
   - Click "Allow" to enable WebMIDI communication

3. **Verify Connection**
   - Navigate to **Visualizer** page
   - Press a pad or key on your MPK Mini
   - Confirm visual feedback appears in real-time

4. **Begin Deployment**
   - Follow the **Deployment Protocol** for FL Studio integration
   - Complete Phase 1 (System), Phase 2 (Scripts), Phase 3 (Workflow)

### Navigation Tips

- **Keyboard Shortcuts**: Press `?` to view all shortcuts
- **Global Search**: Press `Ctrl+K` (or `Cmd+K`) to search anything
- **Page Navigation**: Use `←` and `→` arrow keys to jump between pages
- **Quick Start**: Press `H` to return to home at any time

---

## 🏗️ Architecture

### Application Structure

```
mpk-command-center/
├── index.html              # SPA entry point
├── css/
│   ├── design-tokens.css   # CSS variables, color system
│   ├── base.css            # Typography, resets, utilities
│   ├── components.css      # Buttons, cards, modals, forms
│   ├── layout.css          # Grid systems, containers
│   ├── pages.css           # Page-specific styles
│   └── visualizer.css      # Hardware visualizer styles
├── js/
│   ├── app.js              # Main SPA router & page renderer
│   ├── midi-service.js     # WebMIDI API wrapper
│   ├── visualizer.js       # Real-time hardware visualization
│   ├── animation-controller.js  # GSAP animation orchestration
│   ├── ui-enhancements.js  # Tooltips, accordions, modals
│   ├── keyboard-nav.js     # Keyboard shortcut system
│   ├── progress-tracker.js # Deployment checklist state
│   ├── transitions.js      # Page transition effects
│   ├── cursor.js           # Custom cursor controller
│   ├── particles.js        # Background particle system
│   ├── toc.js              # Table of contents generator
│   └── data/
│       ├── controls.js     # Hardware control specifications
│       ├── troubleshooting.js  # Issue database
│       ├── pages.js        # Deployment phases, workflows, glossary
│       └── icons.js        # SVG icon library
└── assets/                 # Images, PDFs, research materials
```

### Three-Layer Signal Flow

The application mirrors the MPK Mini's actual data flow architecture:

#### Layer 1: Physical (Hardware)
- **MPK Editor Configuration**: Pad sensitivity, velocity curves, CC assignments
- **Program Banks**: 8 onboard presets stored in device memory
- **Hardware State**: Button combinations (PROG + Pad) for program switching

#### Layer 2: Logic (Software)
- **FL Studio MIDI Settings**: Port assignments, enable/disable inputs
- **Controller Linking**: Automatic parameter detection and mapping
- **Python Scripts**: Custom device scripts in `Settings/Hardware/`

#### Layer 3: Workflow (Creative)
- **Omni Preview**: Sequential sample triggering without changing channels
- **Performance Mode**: Clip launching and scene arrangement
- **Patcher**: Multi-instrument routing and complex signal chains

### Technology Stack

| **Category**       | **Technology**                 | **Purpose**                                         |
|--------------------|--------------------------------|-----------------------------------------------------|
| **Core Language**  | Vanilla JavaScript (ES6+)      | Zero framework overhead, native performance         |
| **Modules**        | ES6 Modules                    | Code organization without bundlers                  |
| **Styling**        | CSS3 + Custom Properties       | Advanced glassmorphism, design tokens               |
| **Animation**      | GSAP 3.12.5                    | Physics-based animations, ScrollTrigger             |
| **MIDI**           | WebMIDI API                    | Direct hardware communication in browser            |
| **State**          | LocalStorage + In-Memory       | Persistent deployment progress, theme preferences   |
| **Routing**        | Hash-based SPA Router          | Client-side navigation without server requirements  |
| **Typography**     | Inter + JetBrains Mono         | Professional UI font + monospace for code           |

### Design Philosophy

**Zero Dependencies, Maximum Impact**

- **No Build Step**: No webpack, no npm scripts, no compilation
- **No Framework Lock-In**: Runs on any static HTTP server
- **Progressive Enhancement**: Works without JavaScript for content reading
- **Web Standards First**: Leveraging platform capabilities (WebMIDI, CSS Grid, Custom Properties)
- **Performance Obsessed**: First Contentful Paint < 1s, Time to Interactive < 2s

---

## 🗺️ Roadmap

### ✅ Version 1.0 - Foundation (Completed)

- [x] **Real-Time Visualizer**: WebMIDI integration with hardware mirroring
- [x] **System Architecture**: Three-layer documentation with signal flow diagrams
- [x] **Hardware Encyclopedia**: Complete control specifications with mode-based tips
- [x] **Deployment Protocol**: Three-phase setup with persistent checklist tracking
- [x] **Workflow Library**: 5+ production techniques with step-by-step guides
- [x] **Troubleshooting Matrix**: 15+ common issues with layer-based diagnostics
- [x] **MIDI Reference**: CC maps, glossary, script paths, downloadable templates
- [x] **Glass Mainframe UI**: GSAP animations, custom cursor, theme system
- [x] **Command Palette**: Global search with keyboard navigation
- [x] **SPA Architecture**: Client-side routing with page transitions

### 🔄 Version 1.1 - Refinement (In Progress)

- [ ] **Advanced Visualizer**: 3D controller model with WebGL rendering
- [ ] **Audio Feedback**: Optional pad trigger sounds for offline testing
- [ ] **Export Configurations**: Generate MPK Editor `.mpk3` files directly
- [ ] **Video Tutorials**: Embedded walkthrough videos for complex workflows
- [ ] **Mobile Optimization**: Touch gestures, responsive visualizer layout
- [ ] **Offline Mode**: PWA capabilities with service worker caching

### 🚀 Version 2.0 - Intelligence (Planned)

- [ ] **AI Configuration Assistant**: Natural language setup ("Configure pads for trap drums")
- [ ] **Conflict Detector**: Automatic CC collision detection with suggested fixes
- [ ] **Preset Marketplace**: Community-shared MPK programs for different genres
- [ ] **FL Studio Integration**: Direct project template export with controller mappings
- [ ] **Session Recorder**: Log MIDI events for replay and pattern analysis
- [ ] **Multi-Device Support**: Extend to MPK Mini Plus, MPK249, MPK261

### 🌐 Version 3.0 - Ecosystem (Future)

- [ ] **Cloud Sync**: User accounts with cross-device configuration backup
- [ ] **Collaboration Tools**: Share configurations and workflows with teams
- [ ] **DAW Extensions**: Ableton Live, Logic Pro X, Bitwig integration guides
- [ ] **Hardware Updates**: Support for firmware-specific features as AKAI releases updates
- [ ] **API Access**: REST API for external tools to query device configurations
- [ ] **Desktop App**: Electron wrapper for OS-level MIDI routing

---

## 🎓 Use Cases

### For Producers

- **First-Time Setup**: Follow deployment protocol to integrate MPK Mini with FL Studio in under 30 minutes
- **Workflow Optimization**: Learn advanced techniques like Omni Preview and Performance Mode
- **Troubleshooting**: Diagnose MIDI issues using layer-based symptom search
- **Reference**: Quick CC lookups while configuring synth parameters

### For Educators

- **Teaching Tool**: Visual MIDI concepts with real-time hardware feedback
- **Course Material**: Comprehensive architecture documentation for music production classes
- **Lab Setup**: Standardized FL Studio configuration for student workstations

### For Performers

- **Live Preparation**: Configure Performance Mode for clip launching workflows
- **Soundcheck**: Verify MIDI connectivity and clock synchronization before shows
- **Backup Configurations**: Export and restore hardware programs between venues

### For Developers

- **WebMIDI Reference**: Clean implementation of browser-based MIDI communication
- **Design System**: Reusable Glass Mainframe components for music software UIs
- **Modular Architecture**: Study SPA routing and state management patterns

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### Development Workflow

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Ideas

- **Hardware Support**: Add configurations for other MIDI controllers
- **DAW Integrations**: Create guides for Ableton Live, Logic Pro, Bitwig
- **Troubleshooting Entries**: Document new issues and solutions
- **Workflow Techniques**: Share advanced production strategies
- **Translations**: Localize content for international users
- **Bug Fixes**: Improve stability and cross-browser compatibility

### Code Standards

- **ES6+ Modern JavaScript**: Use arrow functions, destructuring, template literals
- **No External Dependencies**: Keep the zero-framework philosophy
- **Modular Architecture**: One module per feature/service
- **CSS Conventions**: Follow BEM naming for custom components
- **Performance First**: Test animations for 60fps, optimize asset loading

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

This means you are free to:
- ✅ Use commercially
- ✅ Modify and distribute
- ✅ Use privately
- ✅ Include in commercial products

---

## 🙏 Acknowledgments

- **AKAI Professional** - For the MPK Mini MK3 hardware platform
- **Image-Line** - For FL Studio and its Python scripting API
- **GSAP (GreenSock)** - For world-class animation tooling
- **WebMIDI API Team** - For enabling browser-based MIDI communication
- **Design Inspiration** - Apple's Human Interface Guidelines, Vercel's design system

---

## 📞 Support & Contact

- **Issues**: Report bugs via [GitHub Issues](https://github.com/yourusername/mpk-command-center/issues)
- **Discussions**: Share ideas in [GitHub Discussions](https://github.com/yourusername/mpk-command-center/discussions)
- **Documentation**: Full guides available in the application itself
- **Email**: support@yourwebsite.com (for critical issues)

---

<div align="center">

### 🎹 Built with Precision. Designed for Producers.

**Designed & Built by [JaZeR](https://github.com/yourusername)**

2026 • MPK Command Center • [Website](https://yourwebsite.com) • [GitHub](https://github.com/yourusername/mpk-command-center)

[![GitHub stars](https://img.shields.io/github/stars/yourusername/mpk-command-center?style=social)](https://github.com/yourusername/mpk-command-center/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/mpk-command-center?style=social)](https://github.com/yourusername/mpk-command-center/network)

</div>
