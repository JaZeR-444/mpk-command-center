/**
 * MPK Mini Playbook - Page Animations
 * GSAP ScrollTrigger and entrance animations for premium UI
 */

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  // Musical timing based on 120 BPM
  bpm: 120,
  quarterNote: 60 / 120,
  
  // Animation defaults
  defaults: {
    ease: 'power3.out',
    duration: 0.8
  },
  
  // Stagger timings
  stagger: {
    fast: 0.1,
    normal: 0.15,
    slow: 0.25
  }
};

// ============================================
// HERO ANIMATIONS
// ============================================

export function initHeroAnimations() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  
  // Check reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const tl = gsap.timeline({ defaults: CONFIG.defaults });
  
  // Badge entrance
  tl.from('.hero-badge', {
    y: -20,
    opacity: 0,
    duration: 0.5
  })
  
  // Title entrance with split effect
  .from('.hero h1', {
    y: 40,
    opacity: 0,
    duration: 0.8
  }, '-=0.3')
  
  // Lead text
  .from('.hero .lead', {
    y: 30,
    opacity: 0,
    duration: 0.6
  }, '-=0.4')
  
  // Stats counters (if present)
  .from('.hero-stats .stat', {
    y: 20,
    opacity: 0,
    stagger: CONFIG.stagger.fast,
    duration: 0.5
  }, '-=0.3')
  
  // Action buttons
  .from('.hero-actions .btn', {
    y: 20,
    opacity: 0,
    stagger: CONFIG.stagger.fast,
    duration: 0.5
  }, '-=0.2')
  
  // Mini visualizer preview
  .from('.hero-visualizer-preview', {
    scale: 0.9,
    opacity: 0,
    duration: 0.8,
    ease: 'back.out(1.5)'
  }, '-=0.4');

  // Parallax effect on hero orb
  const heroOrb = document.querySelector('.hero::before');
  if (heroOrb) {
    gsap.to('.hero', {
      '--orb-y': '30%',
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });
  }
}

// ============================================
// SIGNAL FLOW ANIMATIONS
// ============================================

export function initSignalFlowAnimations() {
  const signalFlow = document.querySelector('.signal-flow');
  if (!signalFlow) return;
  
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const nodes = document.querySelectorAll('.signal-flow-node');
  const arrows = document.querySelectorAll('.signal-flow-arrow');
  
  // Set initial state
  gsap.set(nodes, { y: 30, opacity: 0 });
  gsap.set(arrows, { x: -10, opacity: 0 });

  // Animate nodes
  gsap.to(nodes, {
    y: 0,
    opacity: 1,
    stagger: CONFIG.stagger.normal,
    duration: 0.6,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: signalFlow,
      start: 'top 85%',
      toggleActions: 'play none none none'
    }
  });

  // Animate arrows after nodes
  gsap.to(arrows, {
    x: 0,
    opacity: 1,
    stagger: CONFIG.stagger.normal,
    duration: 0.4,
    delay: 0.3,
    scrollTrigger: {
      trigger: signalFlow,
      start: 'top 85%',
      toggleActions: 'play none none none'
    }
  });
}

// ============================================
// PROOF CARDS ANIMATIONS
// ============================================

export function initProofCardsAnimations() {
  const proofCards = document.querySelector('.proof-cards');
  if (!proofCards) return;
  
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = document.querySelectorAll('.proof-card');
  const icons = document.querySelectorAll('.proof-card-icon');
  
  // Set initial state
  gsap.set(cards, { y: 60, opacity: 0 });
  gsap.set(icons, { scale: 0.5, opacity: 0 });

  gsap.to(cards, {
    y: 0,
    opacity: 1,
    stagger: CONFIG.stagger.slow,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: proofCards,
      start: 'top 85%',
      toggleActions: 'play none none none'
    }
  });

  // Icon scale animation
  gsap.to(icons, {
    scale: 1,
    opacity: 1,
    stagger: CONFIG.stagger.slow,
    duration: 0.6,
    ease: 'back.out(2)',
    scrollTrigger: {
      trigger: proofCards,
      start: 'top 85%',
      toggleActions: 'play none none none'
    }
  });
}

// ============================================
// PATH CHOOSER ANIMATIONS
// ============================================

export function initPathChooserAnimations() {
  const pathChooser = document.querySelector('.path-chooser');
  if (!pathChooser) return;
  
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const pathCards = document.querySelectorAll('.path-card');
  const features = document.querySelectorAll('.path-card-feature');
  
  // Set initial state
  gsap.set(pathCards, { y: 80, opacity: 0 });
  gsap.set(features, { x: -20, opacity: 0 });

  gsap.to(pathCards, {
    y: 0,
    opacity: 1,
    stagger: 0.2,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: pathChooser,
      start: 'top 85%',
      toggleActions: 'play none none none'
    }
  });

  // Feature items stagger
  gsap.to(features, {
    x: 0,
    opacity: 1,
    stagger: 0.08,
    duration: 0.4,
    scrollTrigger: {
      trigger: pathChooser,
      start: 'top 75%',
      toggleActions: 'play none none none'
    }
  });
}

// ============================================
// FEATURED GRID ANIMATIONS
// ============================================

export function initFeaturedGridAnimations() {
  const featuredGrid = document.querySelector('.featured-grid');
  if (!featuredGrid) return;
  
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const featuredCards = document.querySelectorAll('.featured-card');
  
  // Set initial state
  gsap.set(featuredCards, { y: 40, opacity: 0 });

  gsap.to(featuredCards, {
    y: 0,
    opacity: 1,
    stagger: {
      amount: 0.6,
      grid: [2, 4],
      from: 'start'
    },
    duration: 0.6,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: featuredGrid,
      start: 'top 85%',
      toggleActions: 'play none none none'
    }
  });
}

// ============================================
// COUNTER ANIMATIONS
// ============================================

export function initCounterAnimations() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;
  
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Just show final values without animation
    counters.forEach(counter => {
      counter.textContent = counter.dataset.counter;
    });
    return;
  }

  counters.forEach(counter => {
    const target = parseInt(counter.dataset.counter, 10);
    const duration = parseFloat(counter.dataset.duration) || 2;
    
    gsap.to(counter, {
      textContent: target,
      duration: duration,
      ease: 'power1.out',
      snap: { textContent: 1 },
      scrollTrigger: {
        trigger: counter,
        start: 'top 90%',
        toggleActions: 'play none none none'
      }
    });
  });
}

// ============================================
// SECTION TITLE ANIMATIONS
// ============================================

export function initSectionTitleAnimations() {
  const titles = document.querySelectorAll('.section-title');
  if (!titles.length) return;
  
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  titles.forEach(title => {
    gsap.from(title, {
      x: -30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });
}

// ============================================
// MAIN INITIALIZER
// ============================================

export function initHomePageAnimations() {
  // Small delay to ensure DOM is ready
  requestAnimationFrame(() => {
    initHeroAnimations();
    initSignalFlowAnimations();
    initProofCardsAnimations();
    initPathChooserAnimations();
    initFeaturedGridAnimations();
    initCounterAnimations();
    initSectionTitleAnimations();
  });
}

// Cleanup function for page navigation
export function cleanupAnimations() {
  ScrollTrigger.getAll().forEach(st => st.kill());
  gsap.killTweensOf('*');
}

export default {
  initHomePageAnimations,
  cleanupAnimations
};
