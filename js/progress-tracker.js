/**
 * MPK Mini Playbook - Progress Tracker
 * Tracks visited sections and shows completion percentage
 */

export class ProgressTracker {
  constructor() {
    this.storageKey = 'mpk-playbook-progress';
    this.sections = [
      'home', 'architecture', 'controls', 'programs',
      'deployment', 'workflows', 'visualizer', 'troubleshooting', 'reference'
    ];
    this.visited = new Set();
    this.recentlyViewed = [];
  }

  init() {
    this.load();
    this.trackCurrentPage();
    this.createWidget();
    this.bindRouteChanges();
  }

  load() {
    try {
      const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      this.visited = new Set(data.visited || []);
      this.recentlyViewed = data.recentlyViewed || [];
    } catch (e) {
      console.warn('Failed to load progress:', e);
    }
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        visited: Array.from(this.visited),
        recentlyViewed: this.recentlyViewed.slice(0, 5)
      }));
    } catch (e) {
      console.warn('Failed to save progress:', e);
    }
  }

  trackCurrentPage() {
    // Handle hash with potential query params (e.g., #/reference?v=123)
    let path = window.location.hash.slice(1); // Remove #
    if (path.startsWith('/')) path = path.slice(1); // Remove leading /
    
    // Strip query parameters
    path = path.split('?')[0];
    
    const section = path.split('/')[0] || 'home';
    
    if (this.sections.includes(section)) {
      this.visited.add(section);
      
      // Update recently viewed
      this.recentlyViewed = this.recentlyViewed.filter(s => s !== section);
      this.recentlyViewed.unshift(section);
      this.recentlyViewed = this.recentlyViewed.slice(0, 5);
      
      this.save();
      this.updateWidget();
    }
  }

  bindRouteChanges() {
    window.addEventListener('hashchange', () => {
      this.trackCurrentPage();
    });
  }

  getProgress() {
    return Math.round((this.visited.size / this.sections.length) * 100);
  }

  createWidget() {
    const widget = document.createElement('div');
    widget.id = 'progress-widget';
    widget.className = 'progress-widget';
    
    const progress = this.getProgress();
    const circumference = 2 * Math.PI * 24; // radius = 24
    const offset = circumference - (progress / 100) * circumference;
    
    widget.innerHTML = `
      <div class="progress-widget-inner">
        <svg class="progress-ring" viewBox="0 0 56 56">
          <circle class="progress-ring-bg" cx="28" cy="28" r="24" />
          <circle class="progress-ring-fill" cx="28" cy="28" r="24" 
                  stroke-dasharray="${circumference}" 
                  stroke-dashoffset="${offset}" />
        </svg>
        <span class="progress-percent">${progress}%</span>
      </div>
      <div class="progress-tooltip">
        <div class="progress-tooltip-title">Progress</div>
        <div class="progress-tooltip-items"></div>
      </div>
    `;
    
    document.body.appendChild(widget);
    
    // Populate tooltip
    this.updateTooltip();
    
    // Toggle tooltip on click
    widget.addEventListener('click', () => {
      widget.classList.toggle('expanded');
    });
  }

  updateWidget() {
    const widget = document.getElementById('progress-widget');
    if (!widget) return;
    
    const progress = this.getProgress();
    const circumference = 2 * Math.PI * 24;
    const offset = circumference - (progress / 100) * circumference;
    
    const fill = widget.querySelector('.progress-ring-fill');
    const percent = widget.querySelector('.progress-percent');
    
    if (fill) fill.style.strokeDashoffset = offset;
    if (percent) percent.textContent = `${progress}%`;
    
    this.updateTooltip();
  }

  updateTooltip() {
    const container = document.querySelector('.progress-tooltip-items');
    if (!container) return;
    
    const sectionLabels = {
      home: '✨ Overview',
      architecture: '🔀 Architecture',
      controls: '🎚️ Controls',
      programs: '💾 Programs',
      deployment: '⚙️ Deployment',
      workflows: '🔥 Workflows',
      visualizer: '🎹 Visualizer',
      troubleshooting: '🩹 Troubleshooting',
      reference: '📚 Reference'
    };
    
    container.innerHTML = this.sections.map(section => `
      <div class="progress-tooltip-item ${this.visited.has(section) ? 'visited' : ''}">
        <span>${sectionLabels[section]}</span>
        <span>${this.visited.has(section) ? '✓' : '○'}</span>
      </div>
    `).join('');
  }

  getRecentlyViewed() {
    return this.recentlyViewed;
  }

  reset() {
    this.visited.clear();
    this.recentlyViewed = [];
    this.save();
    this.updateWidget();
  }
}

// Singleton
let progressTracker = null;

export function initProgressTracker() {
  if (progressTracker) return progressTracker;
  progressTracker = new ProgressTracker();
  progressTracker.init();
  return progressTracker;
}

export function getProgressTracker() {
  return progressTracker;
}

export default ProgressTracker;
