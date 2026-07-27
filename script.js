'use strict';

const menuButton = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const menuOverlay = document.querySelector('.sidebar-overlay');
const navigationLinks = [...document.querySelectorAll('[data-section-link]')];
const allHashLinks = [...document.querySelectorAll('a[href^="#"]')];
const sections = [...document.querySelectorAll('[data-section]')];
const mapLink = document.querySelector('[data-map-link]');
const mapPlaceholder = document.querySelector('#map-placeholder');
const mobileBreakpoint = 960;

function isMobileMenu() {
  return window.innerWidth <= mobileBreakpoint;
}

function openMenu() {
  sidebar.classList.add('is-open');
  menuOverlay.classList.add('is-visible');
  document.body.classList.add('menu-open');
  menuButton.setAttribute('aria-expanded', 'true');

  const firstLink = sidebar.querySelector('.nav-link');
  window.setTimeout(() => firstLink?.focus(), 180);
}

function closeMenu({ returnFocus = false } = {}) {
  sidebar.classList.remove('is-open');
  menuOverlay.classList.remove('is-visible');
  document.body.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded', 'false');

  if (returnFocus) {
    menuButton.focus();
  }
}

menuButton?.addEventListener('click', () => {
  if (sidebar.classList.contains('is-open')) {
    closeMenu({ returnFocus: true });
  } else {
    openMenu();
  }
});

menuOverlay?.addEventListener('click', () => closeMenu());

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && sidebar.classList.contains('is-open')) {
    closeMenu({ returnFocus: true });
  }
});

window.addEventListener('resize', () => {
  if (!isMobileMenu() && sidebar.classList.contains('is-open')) {
    closeMenu();
  }
});

function setActiveLink(sectionId) {
  navigationLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${sectionId}`;
    link.classList.toggle('is-active', isActive);

    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

allHashLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (target.matches('[data-section]')) {
      setActiveLink(target.id);
    }

    if (isMobileMenu()) {
      closeMenu();
    }

    if (history.pushState) {
      history.pushState(null, '', targetId);
    }
  });
});

const visibleSections = new Map();
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        visibleSections.set(entry.target.id, entry.intersectionRatio);
      } else {
        visibleSections.delete(entry.target.id);
      }
    });

    if (!visibleSections.size) return;

    const currentSection = [...visibleSections.entries()].sort((a, b) => b[1] - a[1])[0][0];
    setActiveLink(currentSection);
  },
  {
    rootMargin: '-18% 0px -52% 0px',
    threshold: [0, 0.15, 0.35, 0.6, 0.85],
  }
);

sections.forEach((section) => sectionObserver.observe(section));

mapLink?.addEventListener('click', () => {
  window.setTimeout(() => {
    mapPlaceholder?.focus({ preventScroll: true });
    mapPlaceholder?.classList.add('is-highlighted');
    window.setTimeout(() => mapPlaceholder?.classList.remove('is-highlighted'), 1400);
  }, 650);
});

document.querySelector('[data-current-year]').textContent = new Date().getFullYear();

window.addEventListener('load', () => {
  if (window.location.hash) {
    const initialTarget = document.querySelector(window.location.hash);
    window.setTimeout(() => initialTarget?.scrollIntoView({ block: 'start' }), 40);
  }
});
