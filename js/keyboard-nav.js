/**
 * MPK Mini Playbook - Keyboard Navigation
 * J/K navigation, Enter activation, Cmd+K spotlight
 */

export class KeyboardNav {
  constructor() {
    this.sections = [];
    this.currentIndex = 0;
    this.isEnabled = true;
    this.spotlightOpen = false;
  }

  init() {
    this.updateSections();
    this.bindEvents();
    this.createSpotlight();
  }

  updateSections() {
    this.sections = Array.from(document.querySelectorAll('section, .accordion-item, .path-card, .featured-card'));
  }

  bindEvents() {
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
    
    // Update sections on route change
    window.addEventListener('hashchange', () => {
      setTimeout(() => this.updateSections(), 100);
    });
  }

  handleKeydown(e) {
    // Don't capture if typing in input
    if (e.target.matches('input, textarea, select, [contenteditable]')) {
      return;
    }

    // Spotlight: Cmd+K or Ctrl+K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      this.toggleSpotlight();
      return;
    }

    // Close spotlight on Escape
    if (e.key === 'Escape') {
      if (this.spotlightOpen) {
        this.closeSpotlight();
        return;
      }
    }

    // Don't handle J/K when spotlight is open
    if (this.spotlightOpen) return;

    switch (e.key.toLowerCase()) {
      case 'j':
        e.preventDefault();
        this.navigateNext();
        break;
      case 'k':
        e.preventDefault();
        this.navigatePrev();
        break;
      case 'enter':
        this.activateCurrent();
        break;
      case 'g':
        if (e.shiftKey) {
          e.preventDefault();
          this.navigateToEnd();
        } else {
          e.preventDefault();
          this.navigateToStart();
        }
        break;
    }
  }

  navigateNext() {
    if (this.currentIndex < this.sections.length - 1) {
      this.currentIndex++;
      this.scrollToSection(this.currentIndex);
    }
  }

  navigatePrev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.scrollToSection(this.currentIndex);
    }
  }

  navigateToStart() {
    this.currentIndex = 0;
    this.scrollToSection(0);
  }

  navigateToEnd() {
    this.currentIndex = this.sections.length - 1;
    this.scrollToSection(this.currentIndex);
  }

  scrollToSection(index) {
    const section = this.sections[index];
    if (!section) return;

    // Remove highlight from all
    this.sections.forEach(s => s.classList.remove('keyboard-focused'));
    
    // Add highlight to current
    section.classList.add('keyboard-focused');
    
    // Smooth scroll into view
    section.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    // Show indicator
    this.showNavigationHint(index);
  }

  showNavigationHint(index) {
    let hint = document.getElementById('nav-hint');
    if (!hint) {
      hint = document.createElement('div');
      hint.id = 'nav-hint';
      hint.className = 'nav-hint';
      document.body.appendChild(hint);
    }
    
    hint.textContent = `${index + 1} / ${this.sections.length}`;
    hint.classList.add('visible');
    
    clearTimeout(this.hintTimeout);
    this.hintTimeout = setTimeout(() => {
      hint.classList.remove('visible');
    }, 1500);
  }

  activateCurrent() {
    const section = this.sections[this.currentIndex];
    if (!section) return;

    // Check if it's a clickable element
    if (section.onclick || section.matches('[onclick], a, button')) {
      section.click();
    }
    
    // Check for accordion trigger
    const trigger = section.querySelector('.accordion-trigger');
    if (trigger) {
      trigger.click();
    }
  }

  // ============================================
  // SPOTLIGHT SEARCH
  // ============================================

  createSpotlight() {
    const spotlight = document.createElement('div');
    spotlight.id = 'spotlight';
    spotlight.className = 'spotlight';
    spotlight.innerHTML = `
      <div class="spotlight-backdrop"></div>
      <div class="spotlight-modal">
        <div class="spotlight-input-wrapper">
          <svg class="spotlight-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" class="spotlight-input" placeholder="Search pages, controls, workflows..." />
          <kbd class="spotlight-kbd">ESC</kbd>
        </div>
        <div class="spotlight-results"></div>
        <div class="spotlight-footer">
          <span><kbd>↑↓</kbd> Navigate</span>
          <span><kbd>↵</kbd> Open</span>
          <span><kbd>ESC</kbd> Close</span>
        </div>
      </div>
    `;
    document.body.appendChild(spotlight);

    // Bind spotlight events
    const input = spotlight.querySelector('.spotlight-input');
    const backdrop = spotlight.querySelector('.spotlight-backdrop');
    
    input.addEventListener('input', (e) => this.handleSpotlightSearch(e.target.value));
    input.addEventListener('keydown', (e) => this.handleSpotlightKeydown(e));
    backdrop.addEventListener('click', () => this.closeSpotlight());
  }

  toggleSpotlight() {
    if (this.spotlightOpen) {
      this.closeSpotlight();
    } else {
      this.openSpotlight();
    }
  }

  openSpotlight() {
    const spotlight = document.getElementById('spotlight');
    const input = spotlight.querySelector('.spotlight-input');
    
    spotlight.classList.add('open');
    this.spotlightOpen = true;
    input.value = '';
    input.focus();
    
    // Show initial results
    this.handleSpotlightSearch('');
  }

  closeSpotlight() {
    const spotlight = document.getElementById('spotlight');
    spotlight.classList.remove('open');
    this.spotlightOpen = false;
  }

  handleSpotlightSearch(query) {
    const results = this.getSearchResults(query);
    this.renderSpotlightResults(results);
  }

  getSearchResults(query) {
    const pages = [
      { title: 'Overview', path: '/', icon: '✨', desc: 'Home page and getting started' },
      { title: 'Architecture', path: '/architecture', icon: '🔀', desc: 'System layers and signal flow' },
      { title: 'Controls', path: '/controls', icon: '🎚️', desc: 'Hardware control specifications' },
      { title: 'Programs', path: '/programs', icon: '💾', desc: 'Bank and program configuration' },
      { title: 'Deployment', path: '/deployment', icon: '⚙️', desc: 'FL Studio setup guide' },
      { title: 'Workflows', path: '/workflows', icon: '🔥', desc: 'Patcher macros and automation' },
      { title: 'Visualizer', path: '/visualizer', icon: '🎹', desc: 'Interactive hardware view' },
      { title: 'Troubleshooting', path: '/troubleshooting', icon: '🩹', desc: 'Common issues and fixes' },
      { title: 'Reference', path: '/reference', icon: '📚', desc: 'MIDI specs and glossary' }
    ];

    if (!query) return pages;
    
    const lowerQuery = query.toLowerCase();
    return pages.filter(p => 
      p.title.toLowerCase().includes(lowerQuery) ||
      p.desc.toLowerCase().includes(lowerQuery)
    );
  }

  renderSpotlightResults(results) {
    const container = document.querySelector('.spotlight-results');
    
    if (results.length === 0) {
      container.innerHTML = '<div class="spotlight-empty">No results found</div>';
      return;
    }

    container.innerHTML = results.map((r, i) => `
      <div class="spotlight-result ${i === 0 ? 'selected' : ''}" data-path="${r.path}">
        <span class="spotlight-result-icon">${r.icon}</span>
        <div class="spotlight-result-content">
          <div class="spotlight-result-title">${r.title}</div>
          <div class="spotlight-result-desc">${r.desc}</div>
        </div>
      </div>
    `).join('');

    // Bind click handlers
    container.querySelectorAll('.spotlight-result').forEach(el => {
      el.addEventListener('click', () => {
        const path = el.dataset.path;
        if (window.app && window.app.navigate) {
          window.app.navigate(path);
        }
        this.closeSpotlight();
      });
    });
  }

  handleSpotlightKeydown(e) {
    const results = document.querySelectorAll('.spotlight-result');
    const selected = document.querySelector('.spotlight-result.selected');
    const selectedIndex = Array.from(results).indexOf(selected);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (selectedIndex < results.length - 1) {
          selected?.classList.remove('selected');
          results[selectedIndex + 1].classList.add('selected');
          results[selectedIndex + 1].scrollIntoView({ block: 'nearest' });
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (selectedIndex > 0) {
          selected?.classList.remove('selected');
          results[selectedIndex - 1].classList.add('selected');
          results[selectedIndex - 1].scrollIntoView({ block: 'nearest' });
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (selected) {
          selected.click();
        }
        break;
    }
  }
}

// Singleton
let keyboardNav = null;

export function initKeyboardNav() {
  if (keyboardNav) return;
  keyboardNav = new KeyboardNav();
  keyboardNav.init();
}

export default KeyboardNav;
