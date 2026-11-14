# Browser Tab Reference

A small Chrome/Brave extension that copies a reference to your current tab for Codex, Claude Code, or another coding agent.

## Install locally

1. Open `chrome://extensions` in Chrome or `brave://extensions` in Brave.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this project folder: `/Users/spawn_daddy/Developer/browser-tab-info-extension`.
4. Pin **Browser Tab Reference** from the browser's extensions menu.

No dependencies or build step is required. After editing extension files, click **Reload** on its extensions-page card.

## Use

Open the tab you want to reference, click the extension, select **Chrome** or **Brave**, then click **Copy tab reference**. Your browser selection is remembered locally. Paste the reference into your coding agent:

```text
Browser: Brave
Tab: Application form
URL: https://example.com/apply
Window ID: 123
Tab ID: 456
```

The preview can also be selected and copied manually. Reopen the popup to refresh it after changing tabs or navigating.

## Limits and permissions

- This extension does not connect the agent to your browser or give it control. The agent's tools may use different IDs; titles and URLs help locate the tab visually.
- IDs are scoped to a browser session and can change after restarting. Separate browsers/profiles can have overlapping IDs. This is not an OS application, process, or browser profile ID.
- Browser name comes from your selection, not automatic detection.
- Only `activeTab` permission is required. No background worker, content scripts, network calls, or access to all open tabs.
- Restricted pages may not expose title/URL; missing metadata is shown as `Unavailable`. Missing IDs prevent copying.
- The reference is a snapshot. The URL is copied including its query parameters.

API references: [Tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs), [activeTab](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab), [clipboard in extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard).

## Checks

With Node.js installed:

```sh
node --test tests/*.test.mjs
git diff --check
```

For browser verification, load the extension in both Chrome and Brave. Try multiple tabs and windows, reopen the popup to check the saved browser name, paste the copied reference, and try a restricted page. Check keyboard access and a long or Unicode title. Node tests cover formatting, selection, tab-lookup failures, storage failures, and clipboard failures; they do not replace loading the extension in a browser.
