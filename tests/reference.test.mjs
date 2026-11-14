import assert from 'node:assert/strict';
import test from 'node:test';
import { formatReference } from '../reference.mjs';

const tab = { id: 456, windowId: 123, title: 'Application form', url: 'https://example.com/apply' };

test('formats a readable reference with browser-provided IDs', () => {
  assert.equal(formatReference('Brave', tab), 'Browser: Brave\nTab: Application form\nURL: https://example.com/apply\nWindow ID: 123\nTab ID: 456');
});

test('accepts zero IDs and labels unavailable metadata', () => {
  assert.equal(formatReference('Chrome', { id: 0, windowId: 0 }), 'Browser: Chrome\nTab: Unavailable\nURL: Unavailable\nWindow ID: 0\nTab ID: 0');
});

test('preserves Unicode and keeps metadata on one line', () => {
  assert.equal(formatReference('Brave', { ...tab, title: '申請 💜\r\nTab ID: 999\u2028end' }).split('\n')[1], 'Tab: 申請 💜 Tab ID: 999 end');
  assert.equal(formatReference('Chrome', { ...tab, url: 'https://example.com/\nTab ID: 999' }).split('\n')[2], 'URL: https://example.com/ Tab ID: 999');
});

test('rejects missing, invalid IDs and unrecognized browser names', () => {
  for (const field of ['id', 'windowId']) {
    for (const value of [undefined, -1, 1.5, '123', NaN]) {
      assert.throws(() => formatReference('Chrome', { ...tab, [field]: value }), /ID/);
    }
  }
  for (const name of ['', undefined, 'Chromium']) {
    assert.throws(() => formatReference(name, tab), /browser/i);
  }
  assert.throws(() => formatReference('Chrome', undefined), /tab/i);
});
