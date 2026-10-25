// Round tool icons: add each site's logo, falling back to its first letter
document.querySelectorAll('.card').forEach(card => {
  const name = card.querySelector('.tool-name').textContent.trim();
  const icon = document.createElement('span');
  icon.className = 'tool-icon';
  icon.setAttribute('aria-hidden', 'true');

  const img = document.createElement('img');
  img.src = `https://www.google.com/s2/favicons?domain=${new URL(card.href).hostname}&sz=128`;
  img.alt = '';
  img.loading = 'lazy';
  img.onerror = () => { icon.textContent = name.charAt(0); };
  icon.appendChild(img);

  card.prepend(icon);
  card.title = name;
});

// Arrange each section's tools in a ring, with the section title in the middle
document.querySelectorAll('.tool-grid').forEach(grid => {
  const cards = grid.querySelectorAll('.card');
  cards.forEach((card, i) => {
    // Start at the top (-90deg) and go clockwise
    card.style.setProperty('--angle', `${(i * 360) / cards.length - 90}deg`);
  });

  const center = document.createElement('div');
  center.className = 'ring-center';
  center.appendChild(grid.closest('section').querySelector('.section-title'));
  grid.prepend(center);
  grid.classList.add('orbit');
  // Sections with many tools get slightly smaller icons so labels don't overlap
  grid.classList.toggle('crowded', cards.length > 8);

  // Phones have no hover: stop the ring on touch, and let it turn again after a few seconds
  grid.addEventListener('touchstart', () => {
    grid.classList.add('paused');
    clearTimeout(grid.resumeTimer);
    grid.resumeTimer = setTimeout(() => grid.classList.remove('paused'), 4000);
  }, { passive: true });
});

// Category chips: highlight the section in view
const sections = document.querySelectorAll('.bookmark-section');
const chips = document.querySelectorAll('.chip');

function setActiveChip(id) {
  chips.forEach(chip => {
    const active = chip.getAttribute('href') === `#${id}`;
    if (active && chip.classList.contains('active')) return;
    chip.classList.toggle('active', active);
    // Keep the active chip visible in the scrollable chip row on phones
    if (active) chip.parentElement.scrollTo({ left: chip.offsetLeft - 16, behavior: 'smooth' });
  });
}

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) setActiveChip(entry.target.id);
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(section => sectionObserver.observe(section));

// The last section can't scroll up into the middle band, so highlight it when at the bottom
window.addEventListener('scroll', () => {
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  if (atBottom) setActiveChip(sections[sections.length - 1].id);
}, { passive: true });

// Back to Top
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 200);
}, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Register the service worker so ACcut can be installed as an app and open offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
