/**
 * MPK Playbook - Page Transitions
 * Orchestrates cinematic entry/exit animations using GSAP
 */

export class PageTransitionManager {
  constructor() {
    this.isAnimating = false;
  }

  // Called when a new page is mounted
  animatePageEntry() {
    // Reset state
    gsap.set('.app-main', { opacity: 1 });
    
    const timeline = gsap.timeline({
      defaults: { ease: 'power3.out', duration: 0.8 }
    });

    // 1. Header elements cascade (Logo -> Nav -> Search)
    const headerItems = document.querySelectorAll('.header .logo, .header .nav-link, .header .search-trigger, .header .theme-toggle');
    if (headerItems.length) {
      timeline.from(headerItems, {
        y: -20,
        opacity: 0,
        stagger: 0.05,
        duration: 0.6,
        clearProps: 'all'
      }, 0);
    }

    // 2. Hero Section / Page Title
    const hero = document.querySelector('.hero-section, .page-header');
    if (hero) {
      timeline.from(hero, {
        y: 30,
        opacity: 0,
        duration: 0.8
      }, 0.2);
    }

    // 3. Content Cards / Sections (Cascade)
    const contentItems = document.querySelectorAll('.card, .workflow-card, .phase-card, .faq-item, .reference-section');
    if (contentItems.length) {
      timeline.from(contentItems, {
        y: 40,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        clearProps: 'all' // Ensure interactivity is restored
      }, 0.3);
    }

    // 4. Footer
    const footer = document.querySelector('.footer');
    if (footer) {
      timeline.from(footer, {
        opacity: 0,
        duration: 0.6
      }, 0.8);
    }
    
    return timeline;
  }
}

export const transitionManager = new PageTransitionManager();
