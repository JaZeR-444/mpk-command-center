/**
 * MPK Mini Playbook - Mobile Gestures
 * Swipe navigation and touch enhancements
 */

export class MobileGestures {
  constructor() {
    this.startX = 0;
    this.startY = 0;
    this.threshold = 100; // Minimum swipe distance
    this.restraint = 100; // Maximum perpendicular deviation
    this.isEnabled = true;
  }

  init() {
    // Only enable on touch devices
    if (!('ontouchstart' in window)) return;
    
    this.bindTouchEvents();
    this.createBottomSheet();
  }

  bindTouchEvents() {
    document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
  }

  handleTouchStart(e) {
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();
  }

  handleTouchEnd(e) {
    if (!this.isEnabled) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;
    const deltaTime = Date.now() - this.startTime;
    
    // Must be a quick swipe
    if (deltaTime > 500) return;
    
    // Check for horizontal swipe
    if (Math.abs(deltaX) >= this.threshold && Math.abs(deltaY) <= this.restraint) {
      if (deltaX > 0) {
        this.onSwipeRight();
      } else {
        this.onSwipeLeft();
      }
    }
    
    // Check for vertical swipe (pull to refresh)
    if (deltaY > this.threshold && Math.abs(deltaX) <= this.restraint && window.scrollY === 0) {
      this.onPullDown();
    }
  }

  onSwipeRight() {
    // Navigate back in history
    if (window.history.length > 1) {
      window.history.back();
    }
  }

  onSwipeLeft() {
    // Could navigate forward or open bottom sheet
    this.openBottomSheet();
  }

  onPullDown() {
    // Pull to refresh animation
    this.showRefreshIndicator();
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  showRefreshIndicator() {
    let indicator = document.getElementById('refresh-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'refresh-indicator';
      indicator.className = 'refresh-indicator';
      indicator.innerHTML = `
        <svg class="refresh-spinner" viewBox="0 0 24 24" width="24" height="24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="60" stroke-dashoffset="0">
            <animate attributeName="stroke-dashoffset" values="0;-60" dur="1s" repeatCount="indefinite" />
          </circle>
        </svg>
        <span>Refreshing...</span>
      `;
      document.body.appendChild(indicator);
    }
    
    indicator.classList.add('visible');
  }

  // ============================================
  // BOTTOM SHEET NAVIGATION
  // ============================================

  createBottomSheet() {
    const sheet = document.createElement('div');
    sheet.id = 'bottom-sheet';
    sheet.className = 'bottom-sheet';
    sheet.innerHTML = `
      <div class="bottom-sheet-backdrop"></div>
      <div class="bottom-sheet-content">
        <div class="bottom-sheet-handle"></div>
        <nav class="bottom-sheet-nav">
          <a class="bottom-sheet-link" href="#/" onclick="closeBottomSheet()">
            <span class="bottom-sheet-icon">✨</span>
            <span>Overview</span>
          </a>
          <a class="bottom-sheet-link" href="#/architecture" onclick="closeBottomSheet()">
            <span class="bottom-sheet-icon">🔀</span>
            <span>Architecture</span>
          </a>
          <a class="bottom-sheet-link" href="#/controls" onclick="closeBottomSheet()">
            <span class="bottom-sheet-icon">🎚️</span>
            <span>Controls</span>
          </a>
          <a class="bottom-sheet-link" href="#/visualizer" onclick="closeBottomSheet()">
            <span class="bottom-sheet-icon">🎹</span>
            <span>Visualizer</span>
          </a>
          <a class="bottom-sheet-link" href="#/deployment" onclick="closeBottomSheet()">
            <span class="bottom-sheet-icon">⚙️</span>
            <span>Deployment</span>
          </a>
        </nav>
      </div>
    `;
    document.body.appendChild(sheet);

    // Close on backdrop click
    sheet.querySelector('.bottom-sheet-backdrop').addEventListener('click', () => {
      this.closeBottomSheet();
    });

    // Make closeBottomSheet available globally
    window.closeBottomSheet = () => this.closeBottomSheet();
  }

  openBottomSheet() {
    const sheet = document.getElementById('bottom-sheet');
    if (sheet) {
      sheet.classList.add('open');
    }
  }

  closeBottomSheet() {
    const sheet = document.getElementById('bottom-sheet');
    if (sheet) {
      sheet.classList.remove('open');
    }
  }
}

// Singleton
let mobileGestures = null;

export function initMobileGestures() {
  if (mobileGestures) return;
  mobileGestures = new MobileGestures();
  mobileGestures.init();
}

export default MobileGestures;
