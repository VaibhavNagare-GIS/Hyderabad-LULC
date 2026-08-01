const LULC_REPOSITORY_URL = 'https://github.com/VaibhavNagare-GIS/Hyderabad-LULC';

function initTabs() {
  document.querySelectorAll('.tab-row').forEach((row) => {
    const buttons = [...row.querySelectorAll('.tab-button')];
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        buttons.forEach((other) => {
          const active = other === button;
          other.setAttribute('aria-selected', String(active));
          const panel = document.getElementById(other.getAttribute('aria-controls'));
          if (panel) panel.hidden = !active;
        });
        window.dispatchEvent(new Event('resize'));
      });
    });
  });
}

window.addEventListener('load', () => {
  const repositoryLink = document.querySelector('#repository-link');
  if (repositoryLink) {
    repositoryLink.href = LULC_REPOSITORY_URL;
    document.querySelector('#repository-slot').hidden = false;
    document.querySelector('.repo-placeholder').hidden = true;
  }
});

initTabs();
