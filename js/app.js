// ============================================
// MPK Mini MK3 Playbook - Main Application
// SPA router, page rendering, and UI controllers
// ============================================

import { icons } from './data/icons.js';
import { AnimationController } from './animation-controller.js';
import { Visualizer } from './visualizer.js';
import { initHomePageAnimations, cleanupAnimations } from './page-animations.js';
import { initParticles } from './particles.js';
import { initCustomCursor } from './cursor.js';
import { initUIEnhancements, initAccordions } from './ui-enhancements.js';
import { initAudioVisualizer } from './audio-visualizer.js';
import { initInteractivePads } from './pad-audio.js';
import { initKeyboardNav } from './keyboard-nav.js';
import { initProgressTracker } from './progress-tracker.js';
import { transitionManager } from './transitions.js';
import { tocGenerator } from './toc.js';
import { initMobileGestures } from './mobile-gestures.js';
import { controlsData } from './data/controls.js';
import { troubleshootingData, maintenanceChecklist } from './data/troubleshooting.js';
import { pages, deploymentPhases, workflows, glossary } from './data/pages.js';

// ─────────────────────────────────────────
// STATE
// ─────────────────────────────────────────

const state = {
  currentPage: 'home',
  theme: localStorage.getItem('mpk-theme') || 'dark',
  searchOpen: false,
  mobileNavOpen: false,
  selectedControl: 'keybed',
  controlMode: 'studio',
  tsFilter: 'all',
  expandedPhases: ['phase-1'],
  checklist: JSON.parse(localStorage.getItem('mpk-deployment-checklist')) || {}
};

// ─────────────────────────────────────────
// INITIALIZATION
// ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRouter();
  renderApp();
  initEventListeners();
  initParticles();
  initCustomCursor();
  initUIEnhancements();
  initAudioVisualizer();
  initKeyboardNav();
  initProgressTracker();
  initMobileGestures();
});

// ─────────────────────────────────────────
// ROUTER
// ─────────────────────────────────────────

function initRouter() {
  // Handle initial route
  const path = window.location.hash.slice(1) || '/';
  navigateTo(path, false);
  
  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    const path = window.location.hash.slice(1) || '/';
    navigateTo(path, false);
  });
}

function navigateTo(path, pushState = true) {
  const page = pages.find(p => p.path === path) || pages[0];
  state.currentPage = page.id;
  
  if (pushState) {
    window.history.pushState(null, '', `#${path}`);
  }
  
  renderPage();
  updateActiveNav();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Cinematic Entry
  requestAnimationFrame(() => {
    transitionManager.animatePageEntry();
    tocGenerator.init();
  });
}

function updateActiveNav() {
  document.querySelectorAll('.nav-link').forEach(link => {
    const path = link.getAttribute('data-path');
    link.classList.toggle('active', path === `/${state.currentPage === 'home' ? '' : state.currentPage}`);
  });
}

// ─────────────────────────────────────────
// THEME
// ─────────────────────────────────────────

function initTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('mpk-theme', state.theme);
  updateThemeIcon();
}

function updateThemeIcon() {
  const icon = document.querySelector('.theme-toggle');
  if (icon) {
    icon.innerHTML = renderIcon(state.theme === 'dark' ? 'theme_light' : 'theme_dark');
  }
}

// ─────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────

function renderIcon(name, className = '') {
  const iconContent = icons[name] || icons.help || ''; // Use help/check default if missing
  // Inject class and ID for animation targeting
  const baseReplacement = `<svg data-icon-id="${name}" class="icon ${className || ''}"`;
  return iconContent.replace('<svg', baseReplacement.trim().replace('"', '"'));
}

// ─────────────────────────────────────────
// APP RENDER
// ─────────────────────────────────────────

function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    ${renderScrollProgress()}
    ${renderHeader()}
    <main class="app-main">
      <div id="page-content"></div>
    </main>
    ${renderFooter()}
    ${renderBackToTop()}
    ${renderToastContainer()}
    ${renderMobileNav()}
    ${renderSearchModal()}
    ${renderKeyboardShortcutsModal()}
    ${renderAboutModal()}
  `;
  
  renderPage();
  updateThemeIcon();
  initGlobalUI();
}

// Global UI Components
function renderScrollProgress() {
  return `<div class="scroll-progress" id="scroll-progress"></div>`;
}

function renderBackToTop() {
  return `
    <button class="back-to-top" id="back-to-top" onclick="window.scrollTo({ top: 0, behavior: 'smooth' })" title="Back to top">
      ${renderIcon('arrow_right', 'icon-md')}
    </button>
  `;
}

function renderToastContainer() {
  return `<div class="toast-container" id="toast-container"></div>`;
}

function renderKeyboardShortcutsModal() {
  return `
    <div class="shortcuts-modal" id="shortcuts-modal">
      <div class="shortcuts-modal-inner">
        <div class="shortcuts-modal-header">
          <h3>Keyboard Shortcuts</h3>
          <button class="shortcuts-close" onclick="window.app.toggleShortcutsModal()">✕</button>
        </div>
        <div class="shortcuts-list">
          <div class="shortcut-item">
            <kbd class="kbd">Ctrl</kbd> + <kbd class="kbd">K</kbd>
            <span>Open search</span>
          </div>
          <div class="shortcut-item">
            <kbd class="kbd">?</kbd>
            <span>Show shortcuts</span>
          </div>
          <div class="shortcut-item">
            <kbd class="kbd">←</kbd> / <kbd class="kbd">→</kbd>
            <span>Previous / Next page</span>
          </div>
          <div class="shortcut-item">
            <kbd class="kbd">H</kbd>
            <span>Go to Home</span>
          </div>
          <div class="shortcut-item">
            <kbd class="kbd">Esc</kbd>
            <span>Close modals</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAboutModal() {
  return `
    <div class="about-modal" id="about-modal" onclick="window.app.handleAboutBackdropClick(event)">
      <div class="about-backdrop"></div>
      <div class="about-content">
        <div class="about-header">
          <div class="about-logo">
            ${renderIcon('keyboard', 'icon-lg icon-accent')} 
            <span>MPK Playbook</span>
          </div>
          <button class="about-close" onclick="window.app.toggleAboutModal()">✕</button>
        </div>
        <div class="about-body">
          <p class="about-desc">
            The ultimate companion guide for integrating the AKAI MPK Mini MK3 with FL Studio.
             Designed to unlock the full potential of your hardware.
          </p>
          
          <div class="about-links">
            <a href="https://github.com/jazer" target="_blank" class="about-link-btn">
              ${renderIcon('github', 'icon-sm')} GitHub
            </a>
            <a href="https://twitter.com/jazer" target="_blank" class="about-link-btn">
              ${renderIcon('twitter', 'icon-sm')} Twitter
            </a>
          </div>
          
          <div class="version-badge">v2026.1.0</div>
        </div>
        <div class="about-footer">
          Designed & Built by <strong>JaZeR</strong> • 2026
        </div>
      </div>
    </div>
  `;
}

// Initialize global UI event listeners
function initGlobalUI() {
  // Scroll progress bar
  window.addEventListener('scroll', () => {
    const scrollProgress = document.getElementById('scroll-progress');
    const backToTop = document.getElementById('back-to-top');
    const header = document.querySelector('.header');
    
    if (scrollProgress) {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.documentElement.clientHeight;
      
      if (docHeight > 0) {
        let progress = (scrollTop / docHeight) * 100;
        progress = Math.min(100, Math.max(0, progress)); // Clamp between 0-100
        scrollProgress.style.width = `${progress}%`;
      }
    }
    
    // Show/hide back to top button
    if (backToTop) {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
    
    // Header scrolled state
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }, { passive: true });
}

// Toast notification system
function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
    <span class="toast-message">${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });
  
  // Remove after duration
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function toggleShortcutsModal() {
  const modal = document.getElementById('shortcuts-modal');
  if (modal) {
    modal.classList.toggle('open');
  }
}

function renderHeader() {
  return `
    <header class="header">
      <div class="header-inner">
        <a href="#/" class="logo" onclick="window.app.navigate('/')">
          <img src="MIDI FAVICON LOGO.svg" alt="MPK Playbook" class="logo-icon">
          <span class="logo-title">MPK Playbook</span>
        </a>
        
        <nav class="nav-primary">
          ${pages.map(page => `
            <a href="#${page.path}" 
               class="nav-link ${state.currentPage === page.id ? 'active' : ''}" 
               data-path="${page.path}"
               onclick="window.app.navigate('${page.path}'); return false;">
              ${page.shortTitle}
            </a>
          `).join('')}
        </nav>
        
        <div class="header-actions">
          <button class="search-trigger" onclick="window.app.toggleSearch()">
            ${renderIcon('search', 'icon-sm')}
            <span class="search-trigger-text">Search...</span>
            <span class="search-trigger-kbd">
              <span class="kbd">Ctrl</span>
              <span class="kbd">K</span>
            </span>
          </button>
          
          <button class="btn btn-primary btn-sm" onclick="window.app.navigate('/deployment')">
            Quick Start
          </button>
          
          <button class="theme-toggle" onclick="window.app.toggleTheme()" aria-label="Toggle theme">
            <!-- Icon initialized by updateThemeIcon -->
          </button>
          
          <button class="mobile-menu-toggle" onclick="window.app.toggleMobileNav()" aria-label="Menu">
            ${renderIcon('menu', 'icon-md')}
          </button>
        </div>
      </div>
    </header>
  `;
}

function renderFooter() {
  return `
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-left">
          <div class="footer-version">
            <span>Guide</span>
            <span class="badge badge-neutral">v1.0</span>
          </div>
          <div class="footer-links">
            <a href="#" class="footer-link">Changelog</a>
            <a href="#" class="footer-link" onclick="window.app.toggleAboutModal(); return false;">Credits</a>
            <a href="#" class="footer-link">Disclaimer</a>
          </div>
        </div>
        <div class="footer-right">
          <em onclick="window.app.toggleAboutModal()" style="cursor: pointer">Designed & Built by JaZeR</em>
        </div>
      </div>
    </footer>
  `;
}

function renderMobileNav() {
  return `
    <div class="mobile-nav ${state.mobileNavOpen ? 'open' : ''}" id="mobile-nav">
      <div class="mobile-nav-inner">
        <div class="mobile-nav-header">
          <span class="logo-title">Navigation</span>
          <button class="mobile-nav-close" onclick="window.app.toggleMobileNav()">✕</button>
        </div>
        <nav class="mobile-nav-links">
          ${pages.map(page => `
            <a href="#${page.path}" 
               class="mobile-nav-link ${state.currentPage === page.id ? 'active' : ''}"
               onclick="window.app.navigate('${page.path}'); window.app.toggleMobileNav(); return false;">
              ${renderIcon(page.icon, 'icon-sm')} ${page.title}
            </a>
          `).join('')}
        </nav>
      </div>
    </div>
  `;
}

function renderSearchModal() {
  return `
    <div class="search-modal ${state.searchOpen ? 'open' : ''}" id="search-modal" onclick="window.app.handleSearchBackdropClick(event)">
      <div class="search-modal-inner">
        <input type="text" 
               class="search-modal-input" 
               placeholder="Search pages, controls, troubleshooting..." 
               id="search-input"
               oninput="window.app.handleSearch(this.value)">
        <div class="search-results" id="search-results">
          ${renderSearchHint()}
        </div>
        <div class="search-hint">
          <span><kbd class="kbd">↑↓</kbd> Navigate</span>
          <span><kbd class="kbd">Enter</kbd> Open</span>
          <span><kbd class="kbd">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  `;
}

function renderSearchHint() {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">${renderIcon('search', 'icon-xl icon-muted')}</div>
      <div class="empty-state-title">Type to search</div>
      <div class="empty-state-text">Search across pages, controls, and troubleshooting topics</div>
    </div>
  `;
}

// ─────────────────────────────────────────
// PAGE RENDERING
// ─────────────────────────────────────────

function renderPage() {
  const container = document.getElementById('page-content');
  if (!container) return;
  
  container.innerHTML = '';
  container.className = 'page';
  
  // Cleanup previous page animations
  cleanupAnimations();
  
  switch (state.currentPage) {
    case 'home':
      container.innerHTML = renderHomePage();
      initHomeAnimations();
      break;
    case 'architecture':
      container.innerHTML = renderArchitecturePage();
      break;
    case 'controls':
      container.innerHTML = renderControlsPage();
      break;
    case 'programs':
      container.innerHTML = renderProgramsPage();
      break;
    case 'deployment':
      container.innerHTML = renderDeploymentPage();
      break;
    case 'workflows':
      container.innerHTML = renderWorkflowsPage();
      break;
    case 'visualizer':
      container.innerHTML = renderVisualizerPage();
      const viz = new Visualizer('mpk-visualizer-root');
      viz.init();
      break;
    case 'troubleshooting':
      container.innerHTML = renderTroubleshootingPage();
      break;
    case 'reference':
      container.innerHTML = renderReferencePage();
      break;
    default:
      container.innerHTML = renderHomePage();
  }
  
  // Reinitialize page-specific event listeners
  // Reinitialize page-specific event listeners
  initPageListeners();
  
  // Initialize GSAP animations for new content
  AnimationController.initAll(container);
}

// ─────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────

function renderHomePage() {
  return `
    <section class="command-hero" id="home-hero">
      <div class="command-hero-bg"></div>
      
      <div class="command-hero-content">
        <div class="command-title-stack">
          <span class="command-eyebrow">System v2026.1</span>
          <h1 class="command-h1">MPK <span>COMMAND</span> CENTER</h1>
          <p class="command-subtitle">
            Advanced operational interface for FL Studio integration. 
            Configure, Visualize, and Perform.
          </p>
        </div>
        
        <!-- 3D Controller Stage -->
        <div class="mpk-3d-stage" id="mpk-stage">
          <div class="mpk-model">
             <!-- Simplified CSS representation of the controller top-down -->
             <div style="padding: 20px; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
                <div style="display: flex; justify-content: space-between;">
                   <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; width: 40%;">
                      ${Array(8).fill('<div style="width: 30px; height: 30px; background: #333; border-radius: 50%; box-shadow: inset 0 2px 5px rgba(0,0,0,0.8);"></div>').join('')}
                   </div>
                   <div style="width: 20%; background: #000; height: 60px; border-radius: 4px; border: 1px solid #444;"></div>
                   <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; width: 35%;">
                      ${Array(8).fill('<div style="width: 40px; height: 40px; background: #222; border-radius: 4px; border: 1px solid #444;"></div>').join('')}
                   </div>
                </div>
                <div style="height: 100px; background: #fff; border-radius: 0 0 4px 4px; display: flex;">
                   ${Array(15).fill('<div style="flex: 1; border-right: 1px solid #ccc; height: 100%;"></div>').join('')}
                </div>
             </div>
          </div>
        </div>
        
        <!-- Bento Grid Nav -->
        <div class="bento-grid">
          <a href="#/deployment" class="bento-card large" onclick="window.app.navigate('/deployment'); return false;">
            <div class="bento-icon">${renderIcon('rocket', 'icon-xl')}</div>
            <div class="bento-content">
              <h3 class="bento-title">Deployment Protocol</h3>
              <p class="bento-desc">Initialize FL Studio configuration. Step-by-step setup guide for MIDI inputs, outputs, and scripting integration.</p>
              <div class="bento-meta">
                <span>Start Here</span>
                <span>→</span>
              </div>
            </div>
          </a>
          
          <a href="#/visualizer" class="bento-card" onclick="window.app.navigate('/visualizer'); return false;">
            <div class="bento-icon">${renderIcon('visualizer', 'icon-lg')}</div>
            <div>
              <h3 class="bento-title">Visualizer</h3>
              <p class="bento-desc">Real-time input analysis.</p>
            </div>
          </a>
          
          <a href="#/controls" class="bento-card" onclick="window.app.navigate('/controls'); return false;">
            <div class="bento-icon">${renderIcon('knob', 'icon-lg')}</div>
            <div>
              <h3 class="bento-title">Controls</h3>
              <p class="bento-desc">Hardware map.</p>
            </div>
          </a>
          
          <a href="#/workflows" class="bento-card wide" onclick="window.app.navigate('/workflows'); return false;">
            <div class="bento-icon">${renderIcon('workflows', 'icon-lg')}</div>
            <div>
              <h3 class="bento-title">Workflow Strategies</h3>
              <p class="bento-desc">Optimize your creative output with specialized loops and performance modes.</p>
            </div>
          </a>
          
          <a href="#/troubleshooting" class="bento-card wide" onclick="window.app.navigate('/troubleshooting'); return false;">
            <div class="bento-icon">${renderIcon('troubleshooting', 'icon-lg')}</div>
            <div>
              <h3 class="bento-title">System Diagnostics</h3>
              <p class="bento-desc">Identify and resolve connection anomalies.</p>
            </div>
          </a>
        </div>

      </div>
      
      <!-- Digital Pipeline Decoration -->
      <div class="pipeline-container">
        <div class="pipeline-track">
          <div class="pipeline-pulse"></div>
        </div>
      </div>
    </section>
  `;
}

function initHomeAnimations() {
  const hero = document.getElementById('home-hero');
  const stage = document.getElementById('mpk-stage');
  
  if (!hero || !stage) return;
  
  // Parallax Effect
  hero.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    // Calculate rotation (-15 to 15 degrees)
    const xRot = ((clientY / innerHeight) - 0.5) * 30; // Rotate X based on Y mouse pos
    const yRot = ((clientX / innerWidth) - 0.5) * -30; // Rotate Y based on X mouse pos
    
    stage.style.transform = `perspective(1000px) rotateX(${xRot}deg) rotateY(${yRot}deg)`;
  });
  
  // Reset on leave
  hero.addEventListener('mouseleave', () => {
    stage.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
  });
}

// ─────────────────────────────────────────
// VISUALIZER PAGE
// ─────────────────────────────────────────

function renderVisualizerPage() {
  return `
    <!-- Hero Section -->
    <section class="page-hero">
      <div class="page-hero-inner">
        <div class="breadcrumbs">
          <a href="#/" class="breadcrumb-link" onclick="window.app.navigate('/'); return false;">Home</a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">Visualizer</span>
        </div>
        <h1 class="page-title gradient-text">Interactive Visualizer</h1>
        <p class="page-subtitle">
          Connect your MPK Mini MK3 to see your inputs in real-time. All pads, keys, knobs, and joystick movements visualized instantly.
        </p>
        
        <div class="live-mode-badge">
          <span class="live-indicator"></span>
          <span class="live-text">LIVE MODE</span>
        </div>
      </div>
    </section>

    <!-- Visualizer Container -->
    <section class="section visualizer-section">
      <div class="section-inner">
        <div id="mpk-visualizer-root">
           <!-- Visualizer injects here -->
        </div>
      </div>
    </section>

    <!-- Quick Tips -->
    <section class="section section-alt">
      <div class="section-inner">
        <div class="callout callout-tip">
          <div class="callout-icon">${renderIcon('tip', 'icon-md')}</div>
          <div class="callout-content">
            <div class="callout-title">💡 Troubleshooting Tips</div>
            <p class="callout-text">
              If nothing happens, ensure your browser allows MIDI access and "MPK Mini mk3" is connected via USB.
              Chrome and Edge have the best Web MIDI support.
            </p>
          </div>
        </div>
        
        <h2 class="section-heading" style="margin-top: var(--space-8);">
          ${renderIcon('arrow_right', 'icon-md icon-accent')}
          <span>Continue Your Journey</span>
        </h2>
        
        <div class="next-steps-grid">
          <a href="#/controls" class="next-step-card" onclick="window.app.navigate('/controls'); return false;">
            <div class="next-step-icon">${renderIcon('encoders', 'icon-lg icon-accent')}</div>
            <div class="next-step-title">Hardware Controls</div>
            <p class="next-step-desc">Deep-dive into each physical control</p>
            <span class="next-step-arrow">→</span>
          </a>
          
          <a href="#/workflows" class="next-step-card" onclick="window.app.navigate('/workflows'); return false;">
            <div class="next-step-icon">${renderIcon('workflows', 'icon-lg icon-accent')}</div>
            <div class="next-step-title">Production Workflows</div>
            <p class="next-step-desc">Learn optimized workflows for your setup</p>
            <span class="next-step-arrow">→</span>
          </a>
          
          <a href="#/troubleshooting" class="next-step-card" onclick="window.app.navigate('/troubleshooting'); return false;">
            <div class="next-step-icon">${renderIcon('troubleshooting', 'icon-lg icon-accent')}</div>
            <div class="next-step-title">Troubleshooting</div>
            <p class="next-step-desc">Fix common issues quickly</p>
            <span class="next-step-arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  `;
}

// ─────────────────────────────────────────
// ARCHITECTURE PAGE
// ─────────────────────────────────────────

function renderArchitecturePage() {
  return `
    <!-- Hero Section -->
    <section class="page-hero">
      <div class="page-hero-inner">
        <div class="breadcrumbs">
          <a href="#/" class="breadcrumb-link" onclick="window.app.navigate('/'); return false;">Home</a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">System Architecture</span>
        </div>
        <h1 class="page-title gradient-text">System Architecture</h1>
        <p class="page-subtitle">
          The MPK Mini operates as a multi-layer control system. Understanding each layer enables 
          precise configuration and troubleshooting.
        </p>
      </div>
    </section>

    <!-- Three-Layer Architecture -->
    <section class="section">
      <div class="section-inner">
        <h2 class="section-title">Three-Layer Architecture</h2>
        <p class="section-desc">Signal flows through three distinct layers, each configurable independently.</p>
        
        <div class="architecture-layers">
          <div class="arch-layer arch-layer-physical">
            <div class="arch-layer-number">01</div>
            <div class="arch-layer-content">
              <div class="arch-layer-icon">
                ${renderIcon('usb', 'icon-xl')}
              </div>
              <h3 class="arch-layer-title">Physical Layer</h3>
              <p class="arch-layer-subtitle">MPK Editor Configuration</p>
              <p class="arch-layer-desc">
                Hardware configuration stored in device memory. Pad sensitivity, velocity curves, 
                CC assignments, and program presets are defined here.
              </p>
              <div class="arch-layer-tags">
                <span class="tag tag-orange">MPK Editor</span>
                <span class="tag">8 Programs</span>
                <span class="tag">Stored in Device</span>
              </div>
            </div>
          </div>
          
          <div class="arch-flow-arrow">
            <svg width="24" height="40" viewBox="0 0 24 40" fill="none" class="flow-arrow-svg">
              <path d="M12 4 L12 28 M7 23 L12 32 L17 23" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          
          <div class="arch-layer arch-layer-logic">
            <div class="arch-layer-number">02</div>
            <div class="arch-layer-content">
              <div class="arch-layer-icon">
                ${renderIcon('scripting', 'icon-xl')}
              </div>
              <h3 class="arch-layer-title">Logic Layer</h3>
              <p class="arch-layer-subtitle">FL Studio Scripts & MIDI Routing</p>
              <p class="arch-layer-desc">
                Software routing via port assignments, controller linking, and Python scripts. 
                FL Studio interprets MIDI data and routes to instruments based on context.
              </p>
              <div class="arch-layer-tags">
                <span class="tag tag-purple">MIDI Settings (F10)</span>
                <span class="tag">Python Scripts</span>
                <span class="tag">Link to Controller</span>
              </div>
            </div>
          </div>
          
          <div class="arch-flow-arrow">
            <svg width="24" height="40" viewBox="0 0 24 40" fill="none" class="flow-arrow-svg">
              <path d="M12 4 L12 28 M7 23 L12 32 L17 23" stroke="var(--accent-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          
          <div class="arch-layer arch-layer-workflow">
            <div class="arch-layer-number">03</div>
            <div class="arch-layer-content">
              <div class="arch-layer-icon">
                ${renderIcon('patcher', 'icon-xl')}
              </div>
              <h3 class="arch-layer-title">Workflow Layer</h3>
              <p class="arch-layer-subtitle">Performance & Advanced Routing</p>
              <p class="arch-layer-desc">
                High-level behaviors: Omni Preview for sequential triggering, Performance Mode 
                for clip launching, and Patcher for complex multi-instrument routing.
              </p>
              <div class="arch-layer-tags">
                <span class="tag tag-cyan">Omni Preview</span>
                <span class="tag">Performance Mode</span>
                <span class="tag">Patcher</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Signal Flow -->
    <section class="section section-alt">
      <div class="section-inner">
        <h2 class="section-title">Signal Flow Analysis</h2>
        
        <div class="signal-flow-grid">
          <div class="signal-card signal-card-input">
            <div class="signal-card-header">
              <div class="signal-card-icon">${renderIcon('midi_in', 'icon-lg')}</div>
              <h3 class="signal-card-title">Input Pipeline</h3>
            </div>
            <p class="signal-card-subtitle">Physical → MIDI → FL Routing → Target</p>
            <ol class="signal-steps">
              <li class="signal-step">
                <span class="signal-step-num">1</span>
                <span class="signal-step-text">Keybed/Pad/Knob physical interaction</span>
              </li>
              <li class="signal-step">
                <span class="signal-step-num">2</span>
                <span class="signal-step-text">MPK converts to MIDI (Note/CC based on Program)</span>
              </li>
              <li class="signal-step">
                <span class="signal-step-num">3</span>
                <span class="signal-step-text">USB transmits to FL Studio MIDI Input</span>
              </li>
              <li class="signal-step">
                <span class="signal-step-num">4</span>
                <span class="signal-step-text">FL routes based on Port, Channel, Script logic</span>
              </li>
              <li class="signal-step">
                <span class="signal-step-num">5</span>
                <span class="signal-step-text">Target instrument/parameter receives data</span>
              </li>
            </ol>
          </div>
          
          <div class="signal-card signal-card-output">
            <div class="signal-card-header">
              <div class="signal-card-icon">${renderIcon('midi_out', 'icon-lg')}</div>
              <h3 class="signal-card-title">Feedback Loop</h3>
            </div>
            <p class="signal-card-subtitle">FL Studio → MIDI Out → MPK Display</p>
            <ol class="signal-steps">
              <li class="signal-step">
                <span class="signal-step-num">1</span>
                <span class="signal-step-text">FL Transport runs (play/record)</span>
              </li>
              <li class="signal-step">
                <span class="signal-step-num">2</span>
                <span class="signal-step-text">Master Sync sends MIDI Clock</span>
              </li>
              <li class="signal-step">
                <span class="signal-step-num">3</span>
                <span class="signal-step-text">MPK receives tempo data</span>
              </li>
              <li class="signal-step">
                <span class="signal-step-num">4</span>
                <span class="signal-step-text">OLED displays BPM and transport status</span>
              </li>
              <li class="signal-step">
                <span class="signal-step-num">5</span>
                <span class="signal-step-text">Note Repeat/Arp syncs to FL tempo</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>

    <!-- Channel Strategy -->
    <section class="section">
      <div class="section-inner">
        <h2 class="section-title">Recommended Channel Strategy</h2>
        <p class="section-desc">Prevent MIDI collision with a structured channel allocation.</p>
        
        <div class="channel-table-wrapper">
          <table class="channel-table">
            <thead>
              <tr>
                <th>Control Group</th>
                <th>Channel</th>
                <th>Rationale</th>
              </tr>
            </thead>
            <tbody>
              <tr class="channel-row channel-keys">
                <td>
                  <div class="channel-control">
                    ${renderIcon('keys', 'icon-md')}
                    <span>Keybed</span>
                  </div>
                </td>
                <td><code class="channel-num">Ch 1</code></td>
                <td>Standard melodic instruments channel</td>
              </tr>
              <tr class="channel-row channel-drums">
                <td>
                  <div class="channel-control">
                    ${renderIcon('pads', 'icon-md')}
                    <span>Pads (Bank A/B)</span>
                  </div>
                </td>
                <td><code class="channel-num channel-drum">Ch 10</code></td>
                <td>GM drums, Omni Preview, no cross-talk with keys</td>
              </tr>
              <tr class="channel-row channel-performance">
                <td>
                  <div class="channel-control">
                    ${renderIcon('fullscreen', 'icon-md')}
                    <span>Performance Mode</span>
                  </div>
                </td>
                <td><code class="channel-num channel-perf">Ch 16</code></td>
                <td>Isolated clip triggering, switch via Program</td>
              </tr>
              <tr class="channel-row channel-encoders">
                <td>
                  <div class="channel-control">
                    ${renderIcon('knob', 'icon-md')}
                    <span>Encoders (CC)</span>
                  </div>
                </td>
                <td><code class="channel-num">Ch 1</code></td>
                <td>Parameter control, same as keys for script context</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="callout callout-warning">
          <div class="callout-icon">${renderIcon('warning', 'icon-md')}</div>
          <div class="callout-content">
            <div class="callout-title">⚠️ Avoid Channel Collisions</div>
            <p class="callout-text">
              Never use the same channel for different instrument types. Keys on Channel 10 will trigger drums. 
              Pads on Channel 1 will send notes to focused synth. Separate by channel to maintain control.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Python Script Example -->
    <section class="section section-alt">
      <div class="section-inner">
        <h2 class="section-title">Python Script Integration</h2>
        <p class="section-desc">FL Studio's MIDI Scripting API enables context-aware control behavior.</p>
        
        <div class="code-block">
          <div class="code-header">
            <span class="code-filename">device_MPK_Mini_MK3.py</span>
            <span class="code-lang">Python</span>
          </div>
          <pre class="code-content"><code class="language-python"># FL Studio MIDI Script for MPK Mini MK3
# Enables focus-aware knob behavior

import transport
import mixer
import channels
import device

def OnMidiMsg(event):
    # Route CC messages based on focused window
    if event.status == 0xB0:  # Control Change
        cc_num = event.data1
        cc_val = event.data2
        
        # Knobs 1-8 control mixer when Pattern is focused
        if cc_num in range(70, 78):
            knob_index = cc_num - 70
            mixer.setTrackVolume(knob_index, cc_val / 127)
            event.handled = True
            
        # When Channel Rack focused, control synth params
        elif channels.channelNumber() >= 0:
            channels.processRECEvent(
                channels.channelNumber(),
                cc_num, cc_val, 0
            )</code></pre>
        </div>
        
        <div class="callout callout-tip">
          <div class="callout-icon">${renderIcon('check_circle', 'icon-md')}</div>
          <div class="callout-content">
            <div class="callout-title">💡 Pro Tip: Focus Detection</div>
            <p class="callout-text">
              Use <code>ui.getFocusedWindow()</code> to detect which FL Studio window has focus, 
              then route knob CCs to different targets based on context.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Next Steps -->
    <section class="section">
      <div class="section-inner">
        <h2 class="section-title">Continue Your Journey</h2>
        <div class="next-steps-grid">
          <a href="#/controls" class="next-step-card" onclick="window.app.navigate('/controls'); return false;">
            <div class="next-step-icon">${renderIcon('knob', 'icon-lg')}</div>
            <h4 class="next-step-title">Hardware Controls</h4>
            <p class="next-step-desc">Explore keybed, pads, and encoder specifications.</p>
            <span class="next-step-arrow">→</span>
          </a>
          <a href="#/programs" class="next-step-card" onclick="window.app.navigate('/programs'); return false;">
            <div class="next-step-icon">${renderIcon('programs', 'icon-lg')}</div>
            <h4 class="next-step-title">Program Banks</h4>
            <p class="next-step-desc">Configure the 8 hardware program presets.</p>
            <span class="next-step-arrow">→</span>
          </a>
          <a href="#/deployment" class="next-step-card" onclick="window.app.navigate('/deployment'); return false;">
            <div class="next-step-icon">${renderIcon('deploy', 'icon-lg')}</div>
            <h4 class="next-step-title">FL Studio Setup</h4>
            <p class="next-step-desc">Step-by-step deployment guide.</p>
            <span class="next-step-arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  `;
}

// ─────────────────────────────────────────
// CONTROLS PAGE
// ─────────────────────────────────────────

function renderControlsPage() {
  const selected = controlsData.find(c => c.id === state.selectedControl) || controlsData[0];
  
  return `
    <!-- Hero Section -->
    <section class="page-hero">
      <div class="page-hero-inner">
        <div class="breadcrumbs">
          <a href="#/" class="breadcrumb-link" onclick="window.app.navigate('/'); return false;">Home</a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">Hardware Controls</span>
        </div>
        <div class="page-hero-header">
          <div>
            <h1 class="page-title gradient-text">Hardware Controls</h1>
            <p class="page-subtitle">
              Complete reference for every physical control: mechanical specs, MIDI behavior, and FL Studio mapping.
            </p>
          </div>
          <div class="mode-toggle">
            <button class="mode-btn ${state.controlMode === 'studio' ? 'active' : ''}" 
                    onclick="window.app.setControlMode('studio')">
              ${renderIcon('studio', 'icon-sm')}
              <span>Studio</span>
            </button>
            <button class="mode-btn ${state.controlMode === 'live' ? 'active' : ''}" 
                    onclick="window.app.setControlMode('live')">
              ${renderIcon('performance_grid', 'icon-sm')}
              <span>Live</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Controls Layout -->
    <section class="section">
      <div class="section-inner">
        <div class="controls-layout">
          <nav class="controls-nav">
            <div class="controls-nav-title">Select Control</div>
            <div class="controls-nav-list">
              ${controlsData.map(ctrl => `
                <button class="controls-nav-item ${ctrl.id === state.selectedControl ? 'active' : ''}"
                        onclick="window.app.selectControl('${ctrl.id}')">
                  <span class="controls-nav-item-icon">${renderIcon(ctrl.icon, 'icon-sm')}</span>
                  <span>${ctrl.name}</span>
                </button>
              `).join('')}
            </div>
          </nav>
          
          <div class="controls-detail">
            ${renderControlDetail(selected)}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderControlDetail(ctrl) {
  const tip = state.controlMode === 'studio' ? ctrl.studioTip : ctrl.liveTip;
  const tipTitle = state.controlMode === 'studio' ? '🎛️ Studio Production Tip' : '🎤 Live Performance Tip';
  
  return `
    <div class="control-spec">
      <div class="control-spec-header">
        <h2 class="control-spec-title">${renderIcon(ctrl.icon, 'icon-lg icon-accent')} ${ctrl.name}</h2>
        <div class="tag-group">
          ${ctrl.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
      
      <div class="control-spec-info">
        <div class="control-spec-meta">
          <div class="meta-item">
            <span class="meta-label">MIDI Type</span>
            <span class="meta-value">${ctrl.midiType}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Channel</span>
            <span class="meta-value">${ctrl.channel}</span>
          </div>
        </div>
        
        <p class="control-spec-desc">${ctrl.description}</p>
        
        <div class="callout callout-tip">
          <div class="callout-icon">${renderIcon('tip', 'icon-md')}</div>
          <div class="callout-content">
            <div class="callout-title">${tipTitle}</div>
            <p class="callout-text">${tip}</p>
          </div>
        </div>
      </div>
      
      <div class="control-spec-body">
        <div class="control-spec-column">
          <h5>⚙️ Mechanical Specs</h5>
          <ul class="spec-list">
            ${ctrl.mechanics.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>
        
        <div class="control-spec-column">
          <h5>🎹 MIDI Behavior</h5>
          <ul class="spec-list">
            ${ctrl.midiBehavior.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>
      </div>
      
      <div class="control-spec-fl">
        <h5>🔥 FL Studio Integration</h5>
        <ul class="spec-list spec-list-fl">
          ${ctrl.flSpecifics.map(m => `<li>${m}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────
// PROGRAMS PAGE
// ─────────────────────────────────────────

function renderProgramsPage() {
  return `
    <!-- Hero Section -->
    <section class="page-hero">
      <div class="page-hero-inner">
        <div class="breadcrumbs">
          <a href="#/" class="breadcrumb-link" onclick="window.app.navigate('/'); return false;">Home</a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">Programs & Banks</span>
        </div>
        <h1 class="page-title gradient-text">Programs, Banks & CC Namespace</h1>
        <p class="page-subtitle">
          Hardware state vs software messages. Understanding the difference enables powerful live switching.
        </p>
      </div>
    </section>

    <!-- Programs Overview -->
    <section class="section">
      <div class="section-inner">
        <h2 class="section-heading">
          ${renderIcon('programs', 'icon-md icon-accent')}
          <span>Programs Overview</span>
        </h2>
        <p class="section-desc">
          The MPK stores 8 onboard Programs—complete configuration sets including channel assignments, CC numbers, velocity curves, and more. 
          Each Program is a snapshot of how the hardware should behave. Factory programs are generic; custom programs unlock FL Studio potential.
        </p>
        
        <div class="callout callout-warning">
          <div class="callout-icon">${renderIcon('warning', 'icon-md')}</div>
          <div class="callout-content">
            <div class="callout-title">⚠️ Why Factory Programs Fail in FL Studio</div>
            <p class="callout-text">
              Factory presets use generic CC mappings that conflict with FL Studio's reserved controllers. 
              They also don't separate keys/pads by channel, causing unintended triggering.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Recommended Configuration -->
    <section class="section section-alt">
      <div class="section-inner">
        <div class="section-header-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-8);">
          <h2 class="section-heading" style="margin-bottom: 0;">
            ${renderIcon('check_circle', 'icon-md icon-success')}
            <span>Recommended Custom FL Studio Program</span>
          </h2>
          <button class="btn btn-sm btn-primary" onclick="window.app.copyProgramConfig()">
            ${renderIcon('copy', 'icon-sm')} Copy Config
          </button>
        </div>
        
        <div class="program-table-wrapper" id="program-config-table">
          <table class="program-table">
            <thead>
              <tr>
                <th>Control Group</th>
                <th>Parameter</th>
                <th>Value</th>
                <th>Architectural Reason</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="control-group">
                  ${renderIcon('pads', 'icon-sm')}
                  <span>Pads (Bank A)</span>
                </td>
                <td>MIDI Channel</td>
                <td><span class="value-badge value-channel">10</span></td>
                <td>Separates drums from Keys (Ch 1) to prevent cross-talk</td>
              </tr>
              <tr>
                <td class="control-group">
                  ${renderIcon('pads', 'icon-sm')}
                  <span>Pads (Bank B)</span>
                </td>
                <td>MIDI Channel</td>
                <td><span class="value-badge value-channel">10</span></td>
                <td>Both banks on same channel for extended drum range</td>
              </tr>
              <tr>
                <td class="control-group">
                  ${renderIcon('encoders', 'icon-sm')}
                  <span>Knobs 1-8</span>
                </td>
                <td>CC Numbers</td>
                <td><span class="value-badge value-cc">70-77</span></td>
                <td>Avoids conflicts with Volume (7), Pan (10), Mod (1)</td>
              </tr>
              <tr>
                <td class="control-group">
                  ${renderIcon('joystick', 'icon-sm')}
                  <span>Joystick Y</span>
                </td>
                <td>CC Number</td>
                <td><span class="value-badge value-cc">1</span></td>
                <td>Standard modulation—auto-mapped by most synths</td>
              </tr>
              <tr>
                <td class="control-group">
                  ${renderIcon('clock', 'icon-sm')}
                  <span>Clock</span>
                </td>
                <td>Source</td>
                <td><span class="value-badge value-external">External</span></td>
                <td>Slaves hardware arp/repeat to FL Studio tempo</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="callout callout-tip">
          <div class="callout-icon">${renderIcon('tip', 'icon-md')}</div>
          <div class="callout-content">
            <div class="callout-title">💡 Pro Tip: Save to Program 1</div>
            <p class="callout-text">
              Save your custom FL Studio program to slot 1. The MPK always boots into Program 1, 
              so your optimized setup loads automatically every time you connect.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Program Select vs Program Change -->
    <section class="section">
      <div class="section-inner">
        <h2 class="section-heading">
          ${renderIcon('compare', 'icon-md icon-accent')}
          <span>Program Select vs Program Change</span>
        </h2>
        <p class="section-desc">
          Two different concepts that sound similar but do completely different things.
        </p>
        
        <div class="comparison-grid">
          <div class="comparison-card comparison-hardware">
            <div class="comparison-card-header">
              <div class="comparison-icon">${renderIcon('usb', 'icon-lg')}</div>
              <h4>Program Select (Hardware)</h4>
            </div>
            <p class="comparison-desc">
              A physical button combo (PROG + Pad) that loads internal configuration states. 
              It changes <strong>how the hardware behaves</strong>—which channels pads use, what CCs knobs send, etc.
            </p>
            <div class="comparison-tags">
              <span class="tag tag-orange">Local Function</span>
              <span class="tag">No MIDI Sent</span>
              <span class="tag">Changes MPK Config</span>
            </div>
          </div>
          
          <div class="comparison-card comparison-midi">
            <div class="comparison-card-header">
              <div class="comparison-icon">${renderIcon('cc', 'icon-lg')}</div>
              <h4>Program Change (MIDI Message)</h4>
            </div>
            <p class="comparison-desc">
              A data message (0-127) sent <strong>to FL Studio</strong>. Used to switch plugin presets 
              or trigger pattern changes. Does not affect MPK hardware state.
            </p>
            <div class="comparison-tags">
              <span class="tag tag-purple">MIDI Message</span>
              <span class="tag">Sent to DAW</span>
              <span class="tag">Switches Presets</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CC Namespace Design -->
    <section class="section section-alt">
      <div class="section-inner">
        <h2 class="section-heading">
          ${renderIcon('cc', 'icon-md icon-accent')}
          <span>CC Namespace Design</span>
        </h2>
        <p class="section-desc">
          Avoid reserved CCs to prevent conflict with plugin automation and FL Studio internal functions.
        </p>
        
        <div class="cc-grid">
          <div class="cc-card cc-avoid">
            <div class="cc-card-header">
              <span class="cc-indicator cc-danger"></span>
              <h4>🚫 Reserved CCs (Avoid)</h4>
            </div>
            <ul class="cc-list">
              <li><code>CC 1</code> — Modulation (use for Joystick Y only)</li>
              <li><code>CC 7</code> — Volume</li>
              <li><code>CC 10</code> — Pan</li>
              <li><code>CC 11</code> — Expression</li>
              <li><code>CC 64</code> — Sustain Pedal</li>
              <li><code>CC 120-127</code> — Channel Mode Messages</li>
            </ul>
          </div>
          
          <div class="cc-card cc-safe">
            <div class="cc-card-header">
              <span class="cc-indicator cc-success"></span>
              <h4>✅ Safe CC Ranges</h4>
            </div>
            <ul class="cc-list">
              <li><code>CC 70-79</code> — Sound Controller range (recommended for knobs)</li>
              <li><code>CC 80-83</code> — General Purpose 5-8</li>
              <li><code>CC 85-90</code> — Undefined (safe)</li>
              <li><code>CC 102-119</code> — Undefined (safe)</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Next Steps -->
    <section class="section">
      <div class="section-inner">
        <h2 class="section-heading">
          ${renderIcon('arrow_right', 'icon-md icon-accent')}
          <span>Continue Your Journey</span>
        </h2>
        
        <div class="next-steps-grid">
          <a href="#/deployment" class="next-step-card" onclick="window.app.navigate('/deployment'); return false;">
            <div class="next-step-icon">${renderIcon('deploy', 'icon-lg icon-accent')}</div>
            <div class="next-step-title">FL Studio Deployment</div>
            <p class="next-step-desc">Configure MIDI settings and verify your setup</p>
            <span class="next-step-arrow">→</span>
          </a>
          
          <a href="#/workflows" class="next-step-card" onclick="window.app.navigate('/workflows'); return false;">
            <div class="next-step-icon">${renderIcon('workflows', 'icon-lg icon-accent')}</div>
            <div class="next-step-title">Production Workflows</div>
            <p class="next-step-desc">Learn optimized workflows for your setup</p>
            <span class="next-step-arrow">→</span>
          </a>
          
          <a href="#/controls" class="next-step-card" onclick="window.app.navigate('/controls'); return false;">
            <div class="next-step-icon">${renderIcon('encoders', 'icon-lg icon-accent')}</div>
            <div class="next-step-title">Hardware Controls</div>
            <p class="next-step-desc">Deep-dive into each physical control</p>
            <span class="next-step-arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  `;
}

// ─────────────────────────────────────────
// DEPLOYMENT PAGE
// ─────────────────────────────────────────

function renderDeploymentPage() {
  return `
    <!-- Hero Section -->
    <section class="page-hero">
      <div class="page-hero-inner">
        <div class="breadcrumbs">
          <a href="#/" class="breadcrumb-link" onclick="window.app.navigate('/'); return false;">Home</a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">FL Studio Deployment</span>
        </div>
        <h1 class="page-title gradient-text">FL Studio Optimization Strategy</h1>
        <p class="page-subtitle">
          Three-phase deployment with verification gates. Complete each phase before proceeding.
        </p>
        
        <div class="phase-progress">
          <div class="phase-progress-item ${state.expandedPhases.includes('phase-1') ? 'active' : ''}">
            <span class="phase-progress-num">01</span>
            <span class="phase-progress-label">System</span>
          </div>
          <div class="phase-progress-connector"></div>
          <div class="phase-progress-item ${state.expandedPhases.includes('phase-2') ? 'active' : ''}">
            <span class="phase-progress-num">02</span>
            <span class="phase-progress-label">Scripts</span>
          </div>
          <div class="phase-progress-connector"></div>
          <div class="phase-progress-item ${state.expandedPhases.includes('phase-3') ? 'active' : ''}">
            <span class="phase-progress-num">03</span>
            <span class="phase-progress-label">Workflow</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Deployment Phases -->
    <section class="section">
      <div class="section-inner">
        <div class="deployment-phases">
          ${deploymentPhases.map(phase => `
            <div class="deployment-phase ${state.expandedPhases.includes(phase.id) ? 'expanded' : ''}" 
                 data-phase="${phase.id}">
              <div class="deployment-phase-header" onclick="window.app.togglePhase('${phase.id}')">
                <div class="deployment-phase-number">${phase.number}</div>
                <div class="deployment-phase-info">
                  <h3 class="deployment-phase-title">${phase.title}</h3>
                  <p class="deployment-phase-desc">${phase.description}</p>
                </div>
                <div class="deployment-phase-toggle">${renderIcon('arrow_right', 'icon-sm')}</div>
              </div>
              
              <div class="deployment-phase-content">
                <div class="deployment-steps">
                  ${phase.steps.map((step, i) => {
                    const id = `${phase.id}-step-${i}`;
                    const isChecked = state.checklist[id];
                    return `
                    <div class="deployment-step ${isChecked ? 'completed' : ''}" onclick="window.app.toggleChecklist('${id}')">
                      <div class="deployment-step-checkbox">
                        ${isChecked ? renderIcon('check', 'icon-sm') : ''}
                      </div>
                      <div class="deployment-step-content">
                        <h4 class="deployment-step-title">${step.title}</h4>
                        <p class="deployment-step-desc">${step.description}</p>
                      </div>
                    </div>
                  `}).join('')}
                </div>
                
                <div class="deployment-verification">
                  <div class="deployment-verification-title">
                    <span>${renderIcon('check_circle', 'icon-sm icon-success')}</span> 
                    Verification Checklist
                  </div>
                  <div class="checklist">
                    ${phase.verification.map((v, i) => {
                      const id = `${phase.id}-verify-${i}`;
                      const isChecked = state.checklist[id];
                      return `
                      <div class="checklist-item ${isChecked ? 'checked' : ''}" onclick="window.app.toggleChecklist('${id}')">
                        <div class="checklist-checkbox">
                          ${isChecked ? renderIcon('check', 'icon-xs') : ''}
                        </div>
                        <span class="checklist-text">${v}</span>
                      </div>
                    `}).join('')}
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- After Deployment -->
    <section class="section section-alt">
      <div class="section-inner">
        <div class="callout callout-tip">
          <div class="callout-icon">${renderIcon('tip', 'icon-md')}</div>
          <div class="callout-content">
            <div class="callout-title">🎉 After Deployment</div>
            <p class="callout-text">
              Once all three phases are verified, the MPK is fully integrated. 
              Explore <a href="#/workflows" onclick="window.app.navigate('/workflows'); return false;" class="link">Advanced Workflows</a> 
              for performance techniques and automation recipes.
            </p>
          </div>
        </div>
        
        <h2 class="section-heading" style="margin-top: var(--space-8);">
          ${renderIcon('arrow_right', 'icon-md icon-accent')}
          <span>Continue Your Journey</span>
        </h2>
        
        <div class="next-steps-grid">
          <a href="#/workflows" class="next-step-card" onclick="window.app.navigate('/workflows'); return false;">
            <div class="next-step-icon">${renderIcon('workflows', 'icon-lg icon-accent')}</div>
            <div class="next-step-title">Production Workflows</div>
            <p class="next-step-desc">Learn optimized workflows for your setup</p>
            <span class="next-step-arrow">→</span>
          </a>
          
          <a href="#/visualizer" class="next-step-card" onclick="window.app.navigate('/visualizer'); return false;">
            <div class="next-step-icon">${renderIcon('visualizer', 'icon-lg icon-accent')}</div>
            <div class="next-step-title">Interactive Visualizer</div>
            <p class="next-step-desc">See your mappings in action</p>
            <span class="next-step-arrow">→</span>
          </a>
          
          <a href="#/troubleshooting" class="next-step-card" onclick="window.app.navigate('/troubleshooting'); return false;">
            <div class="next-step-icon">${renderIcon('troubleshooting', 'icon-lg icon-accent')}</div>
            <div class="next-step-title">Troubleshooting</div>
            <p class="next-step-desc">Fix common issues quickly</p>
            <span class="next-step-arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  `;
}

// ─────────────────────────────────────────
// WORKFLOWS PAGE
// ─────────────────────────────────────────

function renderWorkflowsPage() {
  return `
    <!-- Hero Section -->
    <section class="page-hero">
      <div class="page-hero-inner">
        <div class="breadcrumbs">
          <a href="#/" class="breadcrumb-link" onclick="window.app.navigate('/'); return false;">Home</a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">Advanced Workflows</span>
        </div>
        <h1 class="page-title gradient-text">Advanced Workflows</h1>
        <p class="page-subtitle">
          Gesture-driven automation and performative arrangement. Transform the MPK into a live performance instrument.
        </p>
        
        <div class="workflow-stats">
          <div class="workflow-stat">
            <span class="workflow-stat-num">${workflows.length}</span>
            <span class="workflow-stat-label">Workflows</span>
          </div>
          <div class="workflow-stat">
            <span class="workflow-stat-num">${workflows.reduce((sum, wf) => sum + wf.steps.length, 0)}</span>
            <span class="workflow-stat-label">Total Steps</span>
          </div>
          <div class="workflow-stat">
            <span class="workflow-stat-num">∞</span>
            <span class="workflow-stat-label">Possibilities</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Workflows Grid -->
    <section class="section">
      <div class="section-inner">
        <div class="workflows-grid">
          ${workflows.map(wf => `
            <div class="workflow-card">
              <div class="workflow-header">
                <div class="workflow-icon">${renderIcon(wf.icon, 'icon-xl')}</div>
                <div>
                  <h3 class="workflow-title">${wf.title}</h3>
                  <p class="workflow-subtitle">${wf.subtitle}</p>
                </div>
              </div>
              
              <div class="workflow-outcomes">
                <h5 class="workflow-section-title">🎯 What You Get</h5>
                <ul class="workflow-outcome-list">
                  ${wf.outcome.map(o => `<li>${o}</li>`).join('')}
                </ul>
              </div>
              
              <div class="workflow-steps">
                ${wf.steps.map((step, i) => `
                  <div class="workflow-step">
                    <div class="workflow-step-number">${i + 1}</div>
                    <div class="workflow-step-content">
                      <h5 class="workflow-step-title">${step.title}</h5>
                      <p class="workflow-step-text">${step.description}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
              
              <div class="workflow-result">
                <div class="workflow-result-title">✨ Result</div>
                <p class="workflow-result-text">${wf.result}</p>
              </div>
              
              <div class="workflow-variations">
                <h5 class="workflow-section-title">🔀 Variations</h5>
                <ul class="workflow-variation-list">
                  ${wf.variations.map(v => `<li>${v}</li>`).join('')}
                </ul>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Next Steps -->
    <section class="section section-alt">
      <div class="section-inner">
        <h2 class="section-heading">
          ${renderIcon('arrow_right', 'icon-md icon-accent')}
          <span>Continue Your Journey</span>
        </h2>
        
        <div class="next-steps-grid">
          <a href="#/visualizer" class="next-step-card" onclick="window.app.navigate('/visualizer'); return false;">
            <div class="next-step-icon">${renderIcon('visualizer', 'icon-lg icon-accent')}</div>
            <div class="next-step-title">Interactive Visualizer</div>
            <p class="next-step-desc">See your mappings in action</p>
            <span class="next-step-arrow">→</span>
          </a>
          
          <a href="#/controls" class="next-step-card" onclick="window.app.navigate('/controls'); return false;">
            <div class="next-step-icon">${renderIcon('encoders', 'icon-lg icon-accent')}</div>
            <div class="next-step-title">Hardware Controls</div>
            <p class="next-step-desc">Deep-dive into each physical control</p>
            <span class="next-step-arrow">→</span>
          </a>
          
          <a href="#/reference" class="next-step-card" onclick="window.app.navigate('/reference'); return false;">
            <div class="next-step-icon">${renderIcon('reference', 'icon-lg icon-accent')}</div>
            <div class="next-step-title">MIDI Reference</div>
            <p class="next-step-desc">Complete CC and note tables</p>
            <span class="next-step-arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  `;
}

// ─────────────────────────────────────────
// TROUBLESHOOTING PAGE
// ─────────────────────────────────────────

function renderTroubleshootingPage() {
  const categories = ['all', 'clock', 'knob', 'pad', 'port', 'latency'];
  const iconMap = { all: 'troubleshooting', clock: 'clock', knob: 'knob', pad: 'pads', port: 'midi_port', latency: 'latency' };
  const filtered = state.tsFilter === 'all' 
    ? troubleshootingData 
    : troubleshootingData.filter(t => t.category === state.tsFilter);
  
  return `
    <!-- Hero Section -->
    <section class="page-hero">
      <div class="page-hero-inner">
        <div class="breadcrumbs">
          <a href="#/" class="breadcrumb-link" onclick="window.app.navigate('/'); return false;">Home</a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">Troubleshooting</span>
        </div>
        <h1 class="page-title gradient-text">Troubleshooting & Maintenance</h1>
        <p class="page-subtitle">
          Diagnose by layer: clock, ports, mapping, audio buffer. Quick triage for common issues.
        </p>
        
        <div class="ts-stats">
          <div class="ts-stat">
            <span class="ts-stat-num">${troubleshootingData.length}</span>
            <span class="ts-stat-label">Known Issues</span>
          </div>
          <div class="ts-stat">
            <span class="ts-stat-num">${maintenanceChecklist.length}</span>
            <span class="ts-stat-label">Maintenance Tips</span>
          </div>
          <div class="ts-stat">
            <span class="ts-stat-num">100%</span>
            <span class="ts-stat-label">Solvable</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Issue Triage -->
    <section class="section">
      <div class="section-inner">
        <h2 class="section-heading">
          ${renderIcon('troubleshooting', 'icon-md icon-accent')}
          <span>Issue Triage</span>
        </h2>
        
        <div class="ts-search-bar">
          <div class="ts-search-input-wrapper">
            ${renderIcon('search', 'icon-sm ts-search-icon')}
            <input type="text" 
                   class="ts-search-input" 
                   placeholder="Search symptoms, causes, or fixes..." 
                   id="ts-search"
                   oninput="window.app.handleTsSearch(this.value)">
          </div>
          <span class="ts-result-count" id="ts-result-count">${troubleshootingData.length} issues</span>
        </div>
        
        <div class="triage-buttons">
          ${categories.map(cat => `
            <button class="triage-btn ${state.tsFilter === cat ? 'active' : ''}"
                    onclick="window.app.setTsFilter('${cat}')">
              ${renderIcon(iconMap[cat], 'icon-sm')}
              ${cat === 'all' ? 'All Issues' : cat.charAt(0).toUpperCase() + cat.slice(1) + ' Issues'}
            </button>
          `).join('')}
        </div>
        
        <div class="ts-matrix">
          <div class="ts-row header">
            <div class="ts-cell header">🔍 Symptom</div>
            <div class="ts-cell header">⚡ Root Cause</div>
            <div class="ts-cell header">✅ Fix</div>
          </div>
          ${filtered.map(item => {
            const layerColors = { 
              System: 'layer-system', 
              Scripting: 'layer-scripting', 
              Workflow: 'layer-workflow' 
            };
            const layerClass = layerColors[item.layer] || 'layer-system';
            return `
            <div class="ts-row" data-id="${item.id}">
              <div class="ts-cell ts-symptom">
                <span class="layer-badge ${layerClass}">${item.layer}</span>
                <span class="symptom-text">${item.symptom}</span>
              </div>
              <div class="ts-cell ts-cause">${item.cause}</div>
              <div class="ts-cell ts-fix">
                <div class="fix-text">${item.fix}</div>
                ${item.verification ? `
                  <div class="verification-hint">
                    <span class="verify-icon">✓</span>
                    <span class="verify-text">${item.verification}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          `}).join('')}
        </div>
      </div>
    </section>

    <!-- Maintenance Checklist -->
    <section class="section section-alt">
      <div class="section-inner">
        <h2 class="section-heading">
          ${renderIcon('check_circle', 'icon-md icon-accent')}
          <span>Maintenance Checklist</span>
        </h2>
        
        <div class="maintenance-grid">
          ${maintenanceChecklist.map((item, i) => `
            <div class="maintenance-card">
              <div class="maintenance-number">${i + 1}</div>
              <h4 class="maintenance-title">${item.title}</h4>
              <p class="maintenance-desc">${item.description}</p>
              <ol class="maintenance-steps">
                ${item.steps.map(s => `<li>${s}</li>`).join('')}
              </ol>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Next Steps -->
    <section class="section">
      <div class="section-inner">
        <h2 class="section-heading">
          ${renderIcon('arrow_right', 'icon-md icon-accent')}
          <span>Continue Your Journey</span>
        </h2>
        
        <div class="next-steps-grid">
          <a href="#/visualizer" class="next-step-card" onclick="window.app.navigate('/visualizer'); return false;">
            <div class="next-step-icon">${renderIcon('visualizer', 'icon-lg icon-accent')}</div>
            <div class="next-step-title">Interactive Visualizer</div>
            <p class="next-step-desc">Test your hardware connection</p>
            <span class="next-step-arrow">→</span>
          </a>
          
          <a href="#/deployment" class="next-step-card" onclick="window.app.navigate('/deployment'); return false;">
            <div class="next-step-icon">${renderIcon('deployment', 'icon-lg icon-accent')}</div>
            <div class="next-step-title">Deployment Guide</div>
            <p class="next-step-desc">Re-configure your setup</p>
            <span class="next-step-arrow">→</span>
          </a>
          
          <a href="#/reference" class="next-step-card" onclick="window.app.navigate('/reference'); return false;">
            <div class="next-step-icon">${renderIcon('reference', 'icon-lg icon-accent')}</div>
            <div class="next-step-title">MIDI Reference</div>
            <p class="next-step-desc">Verify CC and note numbers</p>
            <span class="next-step-arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  `;
}

// ─────────────────────────────────────────
// REFERENCE PAGE
// ─────────────────────────────────────────

function renderReferencePage() {
  return `
    <!-- Hero Section -->
    <section class="page-hero">
      <div class="page-hero-inner">
        <div class="breadcrumbs">
          <a href="#/" class="breadcrumb-link" onclick="window.app.navigate('/'); return false;">Home</a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">Reference</span>
        </div>
        <h1 class="page-title gradient-text">Reference & Downloads</h1>
        <p class="page-subtitle">
          Configuration assets, glossary, and quick reference materials for MPK Mini MK3 + FL Studio.
        </p>
        
        <div class="ref-stats">
          <div class="ref-stat">
            <span class="ref-stat-num">2</span>
            <span class="ref-stat-label">Downloads</span>
          </div>
          <div class="ref-stat">
            <span class="ref-stat-num">${glossary.length}</span>
            <span class="ref-stat-label">Glossary Terms</span>
          </div>
          <div class="ref-stat">
            <span class="ref-stat-num">10</span>
            <span class="ref-stat-label">CC Mappings</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Downloads Section -->
    <section class="section">
      <div class="section-inner">
        <h2 class="section-heading">
          ${renderIcon('download', 'icon-md icon-accent')}
          <span>Downloads</span>
        </h2>
        
        <div class="downloads-grid">
          <div class="download-card">
            <div class="download-icon">${renderIcon('copy', 'icon-lg icon-accent')}</div>
            <div class="download-info">
              <h4 class="download-title">CC Namespace Template</h4>
              <p class="download-desc">Pre-configured CC map avoiding FL Studio conflicts</p>
              <span class="download-meta">📋 Copy-paste ready</span>
            </div>
          </div>
          
          <div class="download-card">
            <div class="download-icon">${renderIcon('check', 'icon-lg icon-success')}</div>
            <div class="download-info">
              <h4 class="download-title">Setup Verification Checklist</h4>
              <p class="download-desc">Printable checklist for all three deployment phases</p>
              <span class="download-meta">📄 PDF format</span>
            </div>
          </div>
          
          <div class="download-card">
            <div class="download-icon">${renderIcon('programs', 'icon-lg icon-accent')}</div>
            <div class="download-info">
              <h4 class="download-title">Default Program Backup</h4>
              <p class="download-desc">Factory defaults .mpk3 file for MPK Editor</p>
              <span class="download-meta">💾 MPK Editor Import</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CC Map Section -->
    <section class="section section-alt">
      <div class="section-inner">
        <h2 class="section-heading">
          ${renderIcon('cc', 'icon-md icon-accent')}
          <span>Suggested CC Map</span>
        </h2>
        <p class="section-desc">Optimal CC assignments avoiding FL Studio reserved controllers.</p>
        
        <div class="cc-visual-grid">
          <div class="cc-visual-knobs">
            <h4 class="cc-visual-title">🎛️ Rotary Knobs</h4>
            <div class="cc-knob-row">
              ${[1,2,3,4,5,6,7,8].map(n => `
                <div class="cc-knob-item">
                  <div class="cc-knob-circle">K${n}</div>
                  <span class="cc-knob-value">CC ${69 + n}</span>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="cc-visual-joystick">
            <h4 class="cc-visual-title">🕹️ Joystick</h4>
            <div class="cc-joystick-grid">
              <div class="cc-joystick-item">
                <span class="cc-joystick-axis">X-Axis</span>
                <span class="cc-joystick-value">Pitch Bend</span>
              </div>
              <div class="cc-joystick-item">
                <span class="cc-joystick-axis">Y-Axis</span>
                <span class="cc-joystick-value">CC 1 (Mod)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="code-block">
          <div class="code-block-header">
            <span class="code-block-label">MPK Editor Configuration</span>
            <button class="code-block-copy" onclick="window.app.copyCode('cc-map')">📋 Copy</button>
          </div>
          <pre id="cc-map">Knob 1: CC 70
Knob 2: CC 71
Knob 3: CC 72
Knob 4: CC 73
Knob 5: CC 74
Knob 6: CC 75
Knob 7: CC 76
Knob 8: CC 77
Joystick Y: CC 1 (Modulation)
Joystick X: Pitch Bend</pre>
        </div>
      </div>
    </section>

    <!-- Script Path Section -->
    <section class="section">
      <div class="section-inner">
        <h2 class="section-heading">
          ${renderIcon('scripting', 'icon-md icon-accent')}
          <span>Script Installation Path</span>
        </h2>
        <p class="section-desc">Where to place custom FL Studio device scripts.</p>
        
        <div class="path-cards">
          <div class="path-card">
            <div class="path-os">🪟 Windows</div>
            <div class="code-block">
              <div class="code-block-header">
                <span class="code-block-label">Default Path</span>
                <button class="code-block-copy" onclick="window.app.copyCode('script-path-win')">📋 Copy</button>
              </div>
              <pre id="script-path-win">Documents\\Image-Line\\FL Studio\\Settings\\Hardware\\</pre>
            </div>
          </div>
          
          <div class="path-card">
            <div class="path-os">🍎 macOS</div>
            <div class="code-block">
              <div class="code-block-header">
                <span class="code-block-label">Default Path</span>
                <button class="code-block-copy" onclick="window.app.copyCode('script-path-mac')">📋 Copy</button>
              </div>
              <pre id="script-path-mac">~/Documents/Image-Line/FL Studio/Settings/Hardware/</pre>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Glossary Section -->
    <section class="section section-alt">
      <div class="section-inner">
        <h2 class="section-heading">
          ${renderIcon('reference', 'icon-md icon-accent')}
          <span>Glossary</span>
        </h2>
        
        <div class="glossary-search-bar">
          <div class="glossary-search-wrapper">
            ${renderIcon('search', 'icon-sm glossary-search-icon')}
            <input type="text" 
                   class="glossary-search-input" 
                   placeholder="Search terms..." 
                   id="glossary-search"
                   oninput="window.app.handleGlossarySearch(this.value)">
          </div>
          <span class="glossary-count" id="glossary-count">${glossary.length} terms</span>
        </div>
        
        <div class="glossary-grid" id="glossary-grid">
          ${glossary.map(item => `
            <div class="glossary-card" data-term="${item.term.toLowerCase()}">
              <div class="glossary-term">${item.term}</div>
              <p class="glossary-def">${item.definition}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Changelog Section -->
    <section class="section">
      <div class="section-inner">
        <h2 class="section-heading">
          ${renderIcon('clock', 'icon-md icon-accent')}
          <span>Changelog</span>
        </h2>
        
        <div class="changelog-timeline">
          <div class="changelog-entry">
            <div class="changelog-version">v1.0</div>
            <div class="changelog-content">
              <h4 class="changelog-title">Initial Release</h4>
              <p class="changelog-desc">
                Complete 8-section playbook covering system architecture, hardware controls, FL Studio deployment, 
                advanced workflows, troubleshooting matrix, and reference materials.
              </p>
              <span class="changelog-date">January 2026</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Next Steps -->
    <section class="section section-alt">
      <div class="section-inner">
        <h2 class="section-heading">
          ${renderIcon('arrow_right', 'icon-md icon-accent')}
          <span>Continue Your Journey</span>
        </h2>
        
        <div class="next-steps-grid">
          <a href="#/troubleshooting" class="next-step-card" onclick="window.app.navigate('/troubleshooting'); return false;">
            <div class="next-step-icon">${renderIcon('troubleshooting', 'icon-lg icon-accent')}</div>
            <div class="next-step-title">Troubleshooting</div>
            <p class="next-step-desc">Fix common issues quickly</p>
            <span class="next-step-arrow">→</span>
          </a>
          
          <a href="#/deployment" class="next-step-card" onclick="window.app.navigate('/deployment'); return false;">
            <div class="next-step-icon">${renderIcon('deployment', 'icon-lg icon-accent')}</div>
            <div class="next-step-title">Deployment Guide</div>
            <p class="next-step-desc">Configure FL Studio setup</p>
            <span class="next-step-arrow">→</span>
          </a>
          
          <a href="#/visualizer" class="next-step-card" onclick="window.app.navigate('/visualizer'); return false;">
            <div class="next-step-icon">${renderIcon('visualizer', 'icon-lg icon-accent')}</div>
            <div class="next-step-title">Interactive Visualizer</div>
            <p class="next-step-desc">Test your mappings live</p>
            <span class="next-step-arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  `;
}

// ─────────────────────────────────────────
// EVENT LISTENERS
// ─────────────────────────────────────────

function initEventListeners() {
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Don't trigger when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    // Ctrl+K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      toggleSearch();
      return;
    }
    
    // ? for shortcuts modal
    if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      toggleShortcutsModal();
      return;
    }
    
    // H for home
    if (e.key === 'h' || e.key === 'H') {
      navigateTo('/');
      return;
    }
    
    // Arrow keys for page navigation
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const currentIndex = pages.findIndex(p => p.id === state.currentPage);
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        navigateTo(pages[currentIndex - 1].path);
      } else if (e.key === 'ArrowRight' && currentIndex < pages.length - 1) {
        navigateTo(pages[currentIndex + 1].path);
      }
      return;
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
      if (state.searchOpen) toggleSearch();
      if (state.mobileNavOpen) toggleMobileNav();
      
      const shortcutsModal = document.getElementById('shortcuts-modal');
      if (shortcutsModal?.classList.contains('open')) toggleShortcutsModal();
      
      const aboutModal = document.getElementById('about-modal');
      if (aboutModal?.classList.contains('open')) toggleAboutModal();
    }
  });
}

function initPageListeners() {
  // Re-attach any page-specific listeners after render
  
  // Scroll listener for header effects
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }
}

// ─────────────────────────────────────────
// UI ACTIONS
// ─────────────────────────────────────────

function toggleSearch() {
  state.searchOpen = !state.searchOpen;
  const modal = document.getElementById('search-modal');
  if (modal) {
    modal.classList.toggle('open', state.searchOpen);
    if (state.searchOpen) {
      document.getElementById('search-input')?.focus();
    }
  }
}

function handleSearchBackdropClick(e) {
  if (e.target.classList.contains('search-modal')) {
    toggleSearch();
  }
}

function handleSearch(query) {
  const resultsEl = document.getElementById('search-results');
  if (!resultsEl) return;
  
  if (!query.trim()) {
    resultsEl.innerHTML = renderSearchHint();
    return;
  }
  
  const q = query.toLowerCase();
  const results = [];
  
  // Search pages
  pages.forEach(page => {
    if (page.title.toLowerCase().includes(q) || page.description.toLowerCase().includes(q)) {
      results.push({ type: 'page', title: page.title, meta: page.description, path: page.path, icon: page.icon });
    }
  });
  
  // Search controls
  controlsData.forEach(ctrl => {
    if (ctrl.name.toLowerCase().includes(q) || ctrl.description.toLowerCase().includes(q)) {
      results.push({ type: 'control', title: ctrl.name, meta: 'Hardware Control', path: '/controls', icon: ctrl.icon, id: ctrl.id });
    }
  });
  
  // Search troubleshooting
  troubleshootingData.forEach(ts => {
    if (ts.symptom.toLowerCase().includes(q) || ts.fix.toLowerCase().includes(q)) {
      results.push({ type: 'issue', title: ts.symptom, meta: ts.fix, path: '/troubleshooting', icon: 'troubleshooting' });
    }
  });
  
  if (results.length === 0) {
    resultsEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">${renderIcon('search', 'icon-xl icon-muted')}</div>
        <div class="empty-state-title">No results found</div>
        <div class="empty-state-text">Try a different search term</div>
      </div>
    `;
    return;
  }
  
  resultsEl.innerHTML = results.slice(0, 8).map(r => `
    <div class="search-result" onclick="window.app.handleSearchSelect('${r.path}', '${r.id || ''}')">
      <span class="search-result-icon">${renderIcon(r.icon, 'icon-md')}</span>
      <div>
        <div class="search-result-title">${r.title}</div>
        <div class="search-result-meta">${r.meta.substring(0, 80)}${r.meta.length > 80 ? '...' : ''}</div>
      </div>
    </div>
  `).join('');
}

function handleSearchSelect(path, id) {
  toggleSearch();
  navigateTo(path);
  if (id) {
    state.selectedControl = id;
    setTimeout(renderPage, 100);
  }
}

function toggleMobileNav() {
  state.mobileNavOpen = !state.mobileNavOpen;
  const nav = document.getElementById('mobile-nav');
  if (nav) {
    nav.classList.toggle('open', state.mobileNavOpen);
  }
}

function selectControl(id) {
  state.selectedControl = id;
  renderPage();
}

function setControlMode(mode) {
  state.controlMode = mode;
  renderPage();
}

function setTsFilter(filter) {
  state.tsFilter = filter;
  renderPage();
}

function toggleAboutModal() {
  const modal = document.getElementById('about-modal');
  if (modal) {
    modal.classList.toggle('open');
  }
}

function handleAboutBackdropClick(e) {
  if (e.target.classList.contains('about-backdrop') || e.target.classList.contains('about-modal')) {
    toggleAboutModal();
  }
}

function copyProgramConfig() {
  const configText = `
MPK Mini MK3 Custom FL Studio Program:
- Pads Bank A: Channel 10
- Pads Bank B: Channel 10
- Knobs 1-8: CC 70-77
- Joystick Y: CC 1
- Clock: External
  `.trim();
  
  navigator.clipboard.writeText(configText).then(() => {
    showToast('Configuration copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Failed to copy config', 'error');
  });
}

function togglePhase(phaseId) {
  const idx = state.expandedPhases.indexOf(phaseId);
  if (idx > -1) {
    state.expandedPhases.splice(idx, 1);
  } else {
    state.expandedPhases.push(phaseId);
  }
  renderPage();
}

function toggleChecklist(id) {
  state.checklist[id] = !state.checklist[id];
  localStorage.setItem('mpk-deployment-checklist', JSON.stringify(state.checklist));
  renderPage();
}

function copyCode(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    navigator.clipboard.writeText(el.textContent).then(() => {
      showToast('Copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy', 'error');
    });
  }
}

// ─────────────────────────────────────────
// EXPOSE API
// ─────────────────────────────────────────

// Troubleshooting search handler
function handleTsSearch(query) {
  const q = query.toLowerCase().trim();
  const rows = document.querySelectorAll('.ts-matrix .ts-row:not(.header)');
  const countEl = document.getElementById('ts-result-count');
  let visibleCount = 0;
  
  rows.forEach(row => {
    const symptom = row.querySelector('.symptom-text')?.textContent.toLowerCase() || '';
    const cause = row.querySelector('.ts-cause')?.textContent.toLowerCase() || '';
    const fix = row.querySelector('.fix-text')?.textContent.toLowerCase() || '';
    const verification = row.querySelector('.verify-text')?.textContent.toLowerCase() || '';
    
    const matches = !q || symptom.includes(q) || cause.includes(q) || fix.includes(q) || verification.includes(q);
    
    row.style.display = matches ? '' : 'none';
    if (matches) visibleCount++;
  });
  
  if (countEl) {
    countEl.textContent = visibleCount === 1 ? '1 issue' : `${visibleCount} issues`;
  }
}

// Glossary search handler
function handleGlossarySearch(query) {
  const q = query.toLowerCase().trim();
  const cards = document.querySelectorAll('.glossary-card');
  const countEl = document.getElementById('glossary-count');
  let visibleCount = 0;
  
  cards.forEach(card => {
    const term = card.getAttribute('data-term') || '';
    const definition = card.querySelector('.glossary-def')?.textContent.toLowerCase() || '';
    
    const matches = !q || term.includes(q) || definition.includes(q);
    
    card.style.display = matches ? '' : 'none';
    if (matches) visibleCount++;
  });
  
  if (countEl) {
    countEl.textContent = visibleCount === 1 ? '1 term' : `${visibleCount} terms`;
  }
}

window.app = {
  navigate: navigateTo,
  toggleTheme,
  toggleSearch,
  handleSearch,
  handleSearchSelect,
  handleSearchBackdropClick,
  toggleMobileNav,
  selectControl,
  setControlMode,
  setTsFilter,
  togglePhase,
  toggleChecklist,
  copyCode,
  handleTsSearch,
  handleGlossarySearch,
  toggleShortcutsModal,
  toggleAboutModal,
  handleAboutBackdropClick,
  copyProgramConfig,
  showToast
};
