/**
 * MPK Mini Playbook - UI Enhancements
 * Scroll progress, back-to-top button, and scroll hints
 */

// ============================================
// SCROLL PROGRESS BAR
// ============================================

export function initScrollProgress() {
  // Create progress bar element
  const progressBar = document.createElement('div');
  progressBar.id = 'scroll-progress';
  progressBar.innerHTML = '<div class="scroll-progress-fill"></div>';
  document.body.appendChild(progressBar);
  
  const fill = progressBar.querySelector('.scroll-progress-fill');
  
  // Update on scroll
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    fill.style.width = `${progress}%`;
  };
  
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress(); // Initial call
}

// ============================================
// BACK TO TOP BUTTON
// ============================================

export function initBackToTop() {
  // Create button
  const button = document.createElement('button');
  button.id = 'back-to-top';
  button.className = 'back-to-top';
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 15l-6-6-6 6"/>
    </svg>
  `;
  button.setAttribute('aria-label', 'Back to top');
  document.body.appendChild(button);
  
  // Show/hide based on scroll position
  const toggleVisibility = () => {
    if (window.scrollY > 400) {
      button.classList.add('visible');
    } else {
      button.classList.remove('visible');
    }
  };
  
  window.addEventListener('scroll', toggleVisibility, { passive: true });
  
  // Scroll to top on click
  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// ============================================
// SCROLL HINT ARROW
// ============================================

export function initScrollHint() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  
  // Create scroll hint
  const hint = document.createElement('div');
  hint.className = 'scroll-hint';
  hint.innerHTML = `
    <span class="scroll-hint-text">Scroll to explore</span>
    <svg class="scroll-hint-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 5v14M5 12l7 7 7-7"/>
    </svg>
  `;
  hero.appendChild(hint);
  
  // Hide on scroll
  const hideOnScroll = () => {
    if (window.scrollY > 100) {
      hint.classList.add('hidden');
    } else {
      hint.classList.remove('hidden');
    }
  };
  
  window.addEventListener('scroll', hideOnScroll, { passive: true });
}

// ============================================
// THEME TRANSITION
// ============================================

export function initSmoothThemeTransition() {
  // Add transition class to body for smooth theme changes
  const style = document.createElement('style');
  style.textContent = `
    body.theme-transitioning,
    body.theme-transitioning * {
      transition: background-color 0.4s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease !important;
    }
  `;
  document.head.appendChild(style);
  
  // Intercept theme toggle
  const originalToggle = window.app?.toggleTheme;
  if (window.app) {
    window.app.toggleTheme = function() {
      document.body.classList.add('theme-transitioning');
      if (originalToggle) originalToggle.call(window.app);
      setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
      }, 400);
    };
  }
}

// ============================================
// ACCORDION COMPONENT
// ============================================

export function initAccordions() {
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const content = item.querySelector('.accordion-content');
      const isOpen = item.classList.contains('open');
      
      // Close all others in same accordion
      const accordion = item.closest('.accordion');
      accordion.querySelectorAll('.accordion-item.open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          const openContent = openItem.querySelector('.accordion-content');
          gsap.to(openContent, { height: 0, duration: 0.3, ease: 'power2.inOut' });
        }
      });
      
      // Toggle current
      if (isOpen) {
        item.classList.remove('open');
        gsap.to(content, { height: 0, duration: 0.3, ease: 'power2.inOut' });
      } else {
        item.classList.add('open');
        gsap.set(content, { height: 'auto' });
        const height = content.offsetHeight;
        gsap.fromTo(content, { height: 0 }, { height: height, duration: 0.3, ease: 'power2.out' });
      }
    });
  });
}

// ============================================
// INITIALIZE ALL
// ============================================

export function initUIEnhancements() {
  initScrollProgress();
  initBackToTop();
  initScrollHint();
  initSmoothThemeTransition();
}

export default {
  initScrollProgress,
  initBackToTop,
  initScrollHint,
  initSmoothThemeTransition,
  initAccordions,
  initUIEnhancements
};
