/* Apply the saved preference before styles load, without changing review data. */
(() => {
  'use strict';
  const key = 'bitcoin-gui-evidence-theme';
  function apply(value) {
    const theme = value === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#11161e' : '#f7f8fa';
    window.dispatchEvent(new Event('themechange'));
  }
  let saved;
  try { saved = localStorage.getItem(key); } catch { /* Session-only preference. */ }
  apply(saved);
  window.EvidenceTheme = Object.freeze({
    set(value) {
      apply(value);
      try { localStorage.setItem(key, document.documentElement.dataset.theme); } catch { /* Keep the current session usable. */ }
    },
  });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) apply(event.newValue);
  });
})();
