import { formatReference } from './reference.mjs';

const browser = document.getElementById('browser');
const reference = document.getElementById('reference');
const copy = document.getElementById('copy');
const status = document.getElementById('status');
let tab;
let lookupFailed = false;

try {
  const saved = localStorage.getItem('browserName');
  browser.value = ['Chrome', 'Brave'].includes(saved) ? saved : '';
} catch {
  browser.value = '';
}

function render() {
  reference.value = '';
  copy.disabled = true;
  if (lookupFailed) {
    status.textContent = 'Could not read the current tab. Reopen the extension on a browser tab.';
    return;
  }
  try {
    reference.value = formatReference(browser.value, tab);
    copy.disabled = false;
    status.textContent = '';
  } catch (error) {
    status.textContent = error.message;
  }
}

browser.addEventListener('change', () => {
  render();
  try {
    localStorage.setItem('browserName', browser.value);
  } catch {
    if (!copy.disabled) {
      status.textContent = 'Browser choice could not be saved. You can still copy this reference.';
    }
  }
});

copy.addEventListener('click', async () => {
  if (copy.disabled) return;
  copy.disabled = true;
  browser.disabled = true;
  try {
    await navigator.clipboard.writeText(reference.value);
    status.textContent = 'Reference copied.';
  } catch {
    status.textContent = 'Could not access the clipboard. Select the reference and copy it manually.';
  } finally {
    copy.disabled = false;
    browser.disabled = false;
  }
});

try {
  [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  lookupFailed = !tab;
} catch {
  lookupFailed = true;
}
render();
