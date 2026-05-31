const platformEl = document.getElementById('platform');

if (window.electronAPI?.platform) {
  platformEl.textContent = window.electronAPI.platform;
}
