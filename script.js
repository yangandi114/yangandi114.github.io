'use strict';
const navLinks = [...document.querySelectorAll('nav [data-section]')];
const navSections = navLinks.map((link) => document.getElementById(link.dataset.section)).filter(Boolean);
let navFrame = 0;
function updateNavigation() {
  navFrame = 0;
  const header = document.querySelector('.site-header');
  const headerHeight = header ? header.getBoundingClientRect().height : 0;
  document.documentElement.style.setProperty('--header-offset', (headerHeight + 24) + 'px');
  const boundary = headerHeight + 100;
  let current = null;
  for (const section of navSections) {
    if (section.getBoundingClientRect().top <= boundary) current = section.id;
  }
  navLinks.forEach((link) => {
    if (link.dataset.section === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
function queueNavigationUpdate() {
  if (!navFrame) navFrame = window.requestAnimationFrame(updateNavigation);
}
window.addEventListener('scroll', queueNavigationUpdate, { passive: true });
window.addEventListener('resize', queueNavigationUpdate, { passive: true });
updateNavigation();

const previewTabs = document.querySelector('.preview-tabs');
if (previewTabs) {
  const tabs = [...previewTabs.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
  if (tabs.length && panels.every(Boolean)) {
    function selectPreview(index, moveFocus = false) {
      tabs.forEach((tab, i) => {
        const selected = i === index;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[i].hidden = !selected;
      });
      if (moveFocus) tabs[index].focus();
    }
    tabs.forEach((tab, index) => {
      panels[index].setAttribute('role', 'tabpanel');
      panels[index].setAttribute('aria-labelledby', tab.id);
      tab.addEventListener('click', () => selectPreview(index));
      tab.addEventListener('keydown', (event) => {
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        selectPreview(next, true);
      });
    });
    selectPreview(0);
    previewTabs.hidden = false;
  }
}

const dialog = document.getElementById('interface-dialog');
const closeButton = document.getElementById('close-interface');
const dialogTitle = document.getElementById('interface-title');
const dialogImage = document.getElementById('interface-image');
let previousFocus = null;
if (dialog && closeButton && dialogTitle && dialogImage && typeof dialog.showModal === 'function') {
  document.querySelectorAll('[data-interface]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      previousFocus = link;
      const image = link.querySelector('img');
      dialogTitle.textContent = link.dataset.screenTitle || 'Jaunty';
      dialogImage.src = link.href;
      dialogImage.alt = link.dataset.screenAlt || (image ? image.alt : 'Jaunty interface');
      if (!dialog.open) dialog.showModal();
      event.preventDefault();
      document.body.classList.add('dialog-open');
      closeButton.focus();
    });
  });
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (event.target === dialog && outside) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    if (previousFocus && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
  });
}
