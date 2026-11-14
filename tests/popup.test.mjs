import assert from 'node:assert/strict';
import test from 'node:test';

const tab = { id: 456, windowId: 123, title: '<b>申請</b>', url: 'https://example.com/apply' };
let sequence = 0;

async function openPopup({ saved = 'Brave', tabs = [tab], queryError, copyError, storageError } = {}) {
  const elements = Object.fromEntries(['browser', 'reference', 'copy', 'status'].map(id => [id, {
    value: '', textContent: '', disabled: id === 'copy',
    addEventListener(event, handler) { this[event] = handler; },
  }]));
  const writes = [];
  let stored = saved;
  globalThis.document = { getElementById: id => elements[id] };
  globalThis.localStorage = {
    getItem() { if (storageError) throw Error('Unavailable'); return stored; },
    setItem(key, value) { if (storageError) throw Error('Unavailable'); stored = value; },
  };
  globalThis.chrome = { tabs: { async query(options) {
    assert.deepEqual(options, { active: true, currentWindow: true });
    if (queryError) throw queryError;
    return tabs;
  } } };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
    clipboard: { async writeText(value) {
      if (copyError) throw copyError;
      writes.push(value);
    } },
  } });
  await import(`../popup.mjs?test=${++sequence}`);
  return { ...elements, writes, stored: () => stored };
}

test('loads the current tab and copies exactly the selectable preview', async () => {
  const ui = await openPopup();
  assert.equal(ui.copy.disabled, false);
  assert.equal(ui.reference.value, 'Browser: Brave\nTab: <b>申請</b>\nURL: https://example.com/apply\nWindow ID: 123\nTab ID: 456');
  await ui.copy.click();
  assert.deepEqual(ui.writes, [ui.reference.value]);
  assert.match(ui.status.textContent, /copied/i);
});

test('requires a browser choice and remembers a valid change', async () => {
  for (const saved of [null, 'Edge']) {
    const ui = await openPopup({ saved });
    assert.equal(ui.browser.value, '');
    assert.equal(ui.copy.disabled, true);
    ui.browser.value = 'Chrome';
    ui.browser.change();
    assert.equal(ui.stored(), 'Chrome');
    assert.equal(ui.copy.disabled, false);
    assert.match(ui.reference.value, /^Browser: Chrome\n/);
  }
});

test('lookup failures and missing tabs prevent copying and explain the error', async () => {
  for (const options of [{ tabs: [] }, { queryError: Error('Lookup blocked') }, { tabs: [{ ...tab, id: -1 }] }]) {
    const ui = await openPopup(options);
    assert.equal(ui.copy.disabled, true);
    assert.equal(ui.reference.value, '');
    assert.match(ui.status.textContent, /tab/i);
  }
});

test('clipboard failure keeps the preview for manual copying', async () => {
  const ui = await openPopup({ copyError: Error('Denied') });
  const preview = ui.reference.value;
  await ui.copy.click();
  assert.equal(ui.reference.value, preview);
  assert.match(ui.status.textContent, /select.*copy/i);
  assert.doesNotMatch(ui.status.textContent, /copied/i);
  assert.equal(ui.copy.disabled, false);
});

test('unavailable storage does not prevent selecting and copying', async () => {
  const ui = await openPopup({ storageError: true });
  ui.browser.value = 'Brave';
  ui.browser.change();
  await ui.copy.click();
  assert.equal(ui.copy.disabled, false);
  assert.equal(ui.writes.length, 1);
  assert.match(ui.status.textContent, /copied/i);
});

test('storage failure preserves the reason a reference cannot be copied', async () => {
  const ui = await openPopup({ storageError: true, tabs: [] });
  ui.browser.value = 'Brave';
  ui.browser.change();
  assert.equal(ui.copy.disabled, true);
  assert.equal(ui.reference.value, '');
  assert.match(ui.status.textContent, /current tab/);
  assert.doesNotMatch(ui.status.textContent, /still copy/);
});
