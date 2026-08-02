const root = document.documentElement;
const body = document.body;
root.classList.add('js');
const themeToggle = document.querySelector('.theme-toggle');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.primary-nav');
const toast = document.querySelector('[data-toast]');
const metricsRail = document.querySelector('.metrics-rail');
const metricsToggle = document.querySelector('.metrics-toggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.querySelector('[data-year]').textContent = new Date().getFullYear();

function syncThemeControls() {
  const isDark = root.dataset.theme === 'dark';
  themeToggle?.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    'content',
    isDark ? '#090b0d' : '#f2f3ef',
  );
}

syncThemeControls();

themeToggle?.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme;
  try {
    localStorage.setItem('prasham-theme', nextTheme);
  } catch {
    // The visible theme still works when browser storage is unavailable.
  }
  syncThemeControls();
});

metricsToggle?.addEventListener('click', () => {
  const paused = metricsRail?.classList.toggle('is-paused') ?? false;
  metricsToggle.setAttribute('aria-pressed', String(paused));
  metricsToggle.setAttribute('aria-label', paused ? 'Play results animation' : 'Pause results animation');
  metricsToggle.querySelector('span').textContent = paused ? '▶' : 'Ⅱ';
});

function setMenu(open) {
  const wasOpen = body.classList.contains('nav-open');
  body.classList.toggle('nav-open', open);
  menuToggle?.setAttribute('aria-expanded', String(open));
  menuToggle?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');

  if (open) {
    nav?.querySelector('a')?.focus({ preventScroll: true });
  } else if (wasOpen && nav?.contains(document.activeElement)) {
    menuToggle?.focus({ preventScroll: true });
  }
}

menuToggle?.addEventListener('click', () => {
  setMenu(!body.classList.contains('nav-open'));
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 1060) setMenu(false);
});

const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const navLinks = [...document.querySelectorAll('[data-nav-link]')];
const observedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const activeEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!activeEntry) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${activeEntry.target.id}`;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    },
    { rootMargin: '-30% 0px -55% 0px', threshold: [0.01, 0.2, 0.5] },
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}

if (window.matchMedia('(pointer: fine)').matches && !reducedMotion.matches) {
  let frame = 0;
  window.addEventListener('pointermove', (event) => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      root.style.setProperty('--mouse-x', `${event.clientX}px`);
      root.style.setProperty('--mouse-y', `${event.clientY}px`);
      frame = 0;
    });
  });

  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.transform = `perspective(1100px) rotateX(${-y * 2.5}deg) rotateY(${x * 3}deg) translateY(-3px)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}

let toastTimer;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

async function copyEmail() {
  const email = 'prasham1706@gmail.com';
  try {
    await navigator.clipboard.writeText(email);
    showToast('Email copied');
  } catch {
    const input = document.createElement('textarea');
    input.value = email;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand('copy');
    input.remove();
    showToast(copied ? 'Email copied' : 'Copy failed - email is visible above');
  }
}

document.querySelector('[data-copy-email]')?.addEventListener('click', copyEmail);
