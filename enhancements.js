const LULC_REPOSITORY_URL = 'https://github.com/VaibhavNagare-GIS/Hyderabad-LULC';

function enhanceLulcNavigation() {
  const links = [...document.querySelectorAll('.section-nav a')];
  const targets = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio).slice(0, 1).forEach((entry) => {
      links.forEach((link) => link.toggleAttribute('aria-current', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-20% 0px -65% 0px', threshold: [0.1, 0.5] });
  targets.forEach((target) => observer.observe(target));
}

window.addEventListener('load', () => {
  const repositoryLink = document.querySelector('#repository-link');
  if (repositoryLink) {
    repositoryLink.href = LULC_REPOSITORY_URL;
    document.querySelector('#repository-slot').hidden = false;
    document.querySelector('.repo-placeholder').hidden = true;
  }
  document.querySelector('#tab-chart')?.click();
  enhanceLulcNavigation();
});
