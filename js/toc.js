/**
 * MPK Playbook - Table of Contents
 * Generates a sticky "On This Page" sidebar for long documentation pages
 */

export class TOCGenerator {
  constructor() {
    this.observer = null;
    this.tocContainer = null;
  }

  init() {
    this.cleanup();
    
    // Only generate for specific pages or if enough headers exist
    const headers = document.querySelectorAll('.page-content h2, .page-content h3');
    if (headers.length < 2) return;

    this.createSidebar(headers);
    this.setupIntersectionObserver(headers);
  }

  createSidebar(headers) {
    // Create container
    this.tocContainer = document.createElement('div');
    this.tocContainer.className = 'toc-sidebar';
    this.tocContainer.innerHTML = `
      <div class="toc-header">On This Page</div>
      <nav class="toc-nav"></nav>
    `;

    const nav = this.tocContainer.querySelector('.toc-nav');

    headers.forEach((header, index) => {
      // Ensure ID exists
      if (!header.id) {
        header.id = `section-${index}`;
      }

      const link = document.createElement('a');
      link.href = `#${header.id}`;
      link.className = `toc-link toc-${header.tagName.toLowerCase()}`;
      link.textContent = header.textContent;
      
      link.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById(header.id).scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      nav.appendChild(link);
    });

    // Append to main app container (fixed position handled by CSS)
    document.querySelector('.app-main').appendChild(this.tocContainer);
    
    // Animation entry
    requestAnimationFrame(() => {
        this.tocContainer.classList.add('visible');
    });
  }

  setupIntersectionObserver(headers) {
    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -60% 0px', // Active zone in top part of screen
      threshold: 0
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.setActiveLink(entry.target.id);
        }
      });
    }, observerOptions);

    headers.forEach(header => this.observer.observe(header));
  }

  setActiveLink(id) {
    const links = this.tocContainer.querySelectorAll('.toc-link');
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  }

  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.tocContainer) {
      this.tocContainer.remove();
      this.tocContainer = null;
    }
  }
}

export const tocGenerator = new TOCGenerator();
