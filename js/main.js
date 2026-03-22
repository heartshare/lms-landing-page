// Main JavaScript Entry Point

// DOM Ready Helper
function onReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

// Import FAQ module
import { initFAQ } from './faq.js';

// Number Animation Function
function animateNumber(element, target, duration = 2000) {
  let start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic function for smooth animation
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(easeProgress * target);
    element.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target.toLocaleString();
    }
  }

  requestAnimationFrame(update);
}

// Initialize Statistics Animation
function initStatsAnimation() {
  const statCards = document.querySelectorAll('.stat-card');

  if (!statCards.length) {
    console.warn('No stat cards found');
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const numberElement = entry.target.querySelector('.stat-number');

        if (numberElement && numberElement.dataset.target) {
          const target = parseInt(numberElement.dataset.target, 10);
          animateNumber(numberElement, target);
          observer.unobserve(entry.target);
        }
      }
    });
  }, { threshold: 0.5 });

  statCards.forEach(card => observer.observe(card));
  console.log('Statistics animation initialized');
}

// Initialize Scroll Animations
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-animate]');

  if (!animatedElements.length) {
    console.warn('No animated elements found');
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('animate-fade-in-up');
          entry.target.style.opacity = '1';
        }, index * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  animatedElements.forEach(el => {
    el.classList.add('opacity-0');
    observer.observe(el);
  });
  console.log('Scroll animations initialized');
}

// Initialize All Modules
onReady(() => {
  console.log('LMS Landing Page loaded');

  try {
    // Initialize FAQ accordion
    initFAQ();

    // Initialize statistics number animation
    initStatsAnimation();

    // Initialize scroll animations
    initScrollAnimations();

    console.log('All modules initialized successfully');
  } catch (error) {
    console.error('Error initializing modules:', error);
  }
});
