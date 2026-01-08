/**
 * MPK Mini Playbook - Animation Controller
 * Manages GSAP animations for the icon system
 */

export const AnimationController = {
  // Registry of all icon animations
  registry: new Map(),
  
  // Track active observers
  observers: new Map(),

  // Register icon animation configuration
  register(iconId, config) {
    this.registry.set(iconId, {
      idle: config.idle || null,
      hover: config.hover || null,
      active: config.active || null,
      timeline: null
    });
  },

  // Initialize icon with state machine
  init(iconElement) {
    if (!iconElement) return;
    
    // Find icon ID from data attribute or class
    // We'll need to update renderIcon to add data-icon-id
    const iconId = iconElement.dataset.iconId;
    if (!iconId) return;

    const config = this.registry.get(iconId);
    if (!config) return;
    
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    // Start idle animation if available
    if (config.idle) {
      // Use GSAP context for easy cleanup
      const ctx = gsap.context(() => {
        config.timeline = config.idle(iconElement);
      }, iconElement);
      
      // Store context for cleanup
      iconElement._gsapContext = ctx;
    }

    // Event listeners for state changes
    this.attachListeners(iconElement, iconId);
  },
  
  attachListeners(element, iconId) {
    element.addEventListener('mouseenter', () => this.setState(iconId, 'hover', element));
    element.addEventListener('mouseleave', () => this.setState(iconId, 'idle', element));
    element.addEventListener('click', () => this.setState(iconId, 'active', element));
    
    // Cleanup on removal
    // In a full framework we'd use lifecycle hooks, here we rely on page transitions cleaning up DOM
  },

  // Transition between animation states
  setState(iconId, state, element) {
    const config = this.registry.get(iconId);
    if (!config) return;
    
    // Kill current animation context/timeline
    if (element._gsapContext) {
      element._gsapContext.revert(); // This kills tweens created in the context
    }
    
    // Create new context for the state
    const ctx = gsap.context(() => {
      if (config[state]) {
        config.timeline = config[state](element);
      } else if (state === 'idle' && config.idle) {
        // Fallback to idle if leaving hover/active
        config.timeline = config.idle(element);
      }
    }, element);
    
    element._gsapContext = ctx;
  },
  
  // Initialize all icons in a container
  initAll(container = document) {
    container.querySelectorAll('.icon').forEach(icon => {
      // Logic to determine ID if not explicitly set
      // For now, we rely on renderIcon setting data-icon-id
      this.init(icon);
    });
  }
};

// ============================================
// ANIMATION DEFINITIONS
// ============================================

const BPM = 120;
const quarterNote = 60 / BPM; 

// 1. HARDWARE CONTROLS
// --------------------

// Keybed
AnimationController.register('keybed', {
  idle: (el) => gsap.to(el.querySelector(".velocity-wave"), {
    opacity: 0.6,
    scaleY: 1.2,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  }),
  
  hover: (el) => gsap.timeline({ repeat: -1, yoyo: true })
    .to(el.querySelectorAll(".key"), {
      y: 2,
      scaleY: 0.95,
      stagger: { each: 0.1, from: "random" },
      duration: 0.3,
      ease: "power2.inOut"
    }),
    
  active: (el) => gsap.timeline()
    .to(el, { scale: 0.95, duration: 0.05, ease: "power4.in" })
    .to(el, { scale: 1.05, duration: 0.1, ease: "elastic.out(2, 0.3)" })
    .to(el.querySelector(".velocity-wave"), { 
      scale: 2, opacity: 0, duration: 0.4 
    }, "<")
});

// Pads
AnimationController.register('pads', {
  idle: (el) => gsap.to(el.querySelectorAll(".pad"), {
    fillOpacity: 0.5,
    stagger: { each: 0.5, from: "random", repeat: -1, yoyo: true },
    duration: 0.5,
    ease: "sine.inOut"
  }),
  
  hover: (el) => gsap.timeline({ repeat: -1 })
    .to(el.querySelectorAll(".pad"), {
      fill: "currentColor",
      scale: 1.1,
      stagger: 0.1,
      duration: 0.1,
      ease: "power1.out"
    })
    .to(el.querySelectorAll(".pad"), {
      fill: "none",
      scale: 1,
      stagger: 0.1,
      duration: 0.2
    }, "+=0.1")
});

// Encoders
AnimationController.register('encoders', {
  idle: (el) => gsap.to(el.querySelector(".knob-indicator"), {
    rotation: "+=30",
    transformOrigin: "center",
    duration: 4,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  }),
  
  hover: (el) => gsap.to(el.querySelector(".knob-indicator"), {
    rotation: "+=360",
    transformOrigin: "center",
    duration: 2,
    repeat: -1,
    ease: "none"
  })
});

// Joystick
AnimationController.register('joystick', {
  idle: (el) => gsap.to(el.querySelector(".stick"), {
    x: "random(-2, 2)",
    y: "random(-2, 2)",
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  }),
  
  hover: (el) => gsap.to(el.querySelector(".stick"), {
     motionPath: {
      path: [
        { x: 0, y: -5 },
        { x: 5, y: 0 },
        { x: 0, y: 5 },
        { x: -5, y: 0 },
        { x: 0, y: -5 }
      ],
      curviness: 1.5
    },
    duration: 2,
    repeat: -1,
    ease: "none"
  })
});

// 2. SYSTEM
// ---------

// MIDI Port
AnimationController.register('midi_port', {
  idle: (el) => gsap.timeline({ repeat: -1 })
    .fromTo(el.querySelectorAll(".pin"), 
      { opacity: 0.3 },
      { opacity: 1, stagger: 0.2, duration: 0.5, yoyo: true, repeat: 1 }
    )
});

// 3. STATUS
// ---------

// Warning
AnimationController.register('warning', {
  idle: (el) => gsap.to(el, {
    scale: 1.1,
    duration: 0.5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  }) 
});

// Success/Check
AnimationController.register('check', {
  idle: (el) => gsap.fromTo(el, 
    { scale: 1 }, 
    { scale: 1.1, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut" }
  )
});

export default AnimationController;
