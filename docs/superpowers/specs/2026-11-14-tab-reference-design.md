# Tab Reference Design

## Approved intent and scope

Help the user identify one tab among many when talking to Codex or Claude Code. Support Chrome and Brave. Clicking the extension opens a popup; clicking **Copy tab reference** copies the current tab's browser name, title, URL, window ID, and tab ID.

Readable details accompany the IDs because the agent's browser or computer tools may not resolve extension IDs. No agent integration, form filling, record retrieval, or browser control belongs in this extension.

## Approaches

- IDs alone: compact, but not useful to tools that cannot resolve them.
- Readable title and URL plus IDs: the user approved this approach because it helps both visual lookup and tools that understand the IDs.

## Output

```text
Browser: Brave
Tab: Application form
URL: https://example.com/apply
Window ID: 123
Tab ID: 456
```

The values above are illustrative. Copy actual browser-provided tab/window IDs; never substitute an extension ID, OS process ID, or invented application ID. References are snapshots, not permanent links or commands to activate a tab.

## Proposed implementation decisions for plan review

- Manifest V3 popup with plain HTML, CSS, and JavaScript; no dependencies or build step.
- A labeled Chrome/Brave selector supplies the browser name and remembers the user's choice in extension-local storage. Require a choice on first use rather than silently guessing the browser. This is a proposal, not an already approved requirement.
- Read only the current active tab when the popup opens, using the `activeTab` permission. No content scripts, background worker, host permissions, or network requests.
- Show a selectable, read-only preview. Copy that exact preview on a button click; announce success only after clipboard writing succeeds. Preserve the preview on clipboard failure for manual copying.
- Missing title/URL display `Unavailable`; unavailable or invalid tab/window IDs prevent copying and show a clear error. Titles and URLs render as text.

## Success and constraints

The copied text matches the tab selected when the popup opened. Closing and reopening the popup refreshes it. Tab IDs are scoped to the browser session and are not guaranteed to match computer-use or MCP identifiers. The extension does not establish agent access or uniquely identify an OS application instance/profile.

## Documentation checked

- [Chrome Tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs): active-tab lookup, fields, and ID scope.
- [activeTab permission](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab): user-invoked access and restrictions on internal pages.
- [Brave detection guidance](https://github.com/brave/brave-browser/wiki/Detecting-Brave-%28for-Websites%29): browser detection is separate from extension/tab identity; a user-selected label avoids claiming a guaranteed detection mechanism.
- [Clipboard in extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard): clipboard writing from an extension page.

Context7 was not run: the requested outside-sandbox execution is unavailable under this session's permissions. Official documentation was read directly instead. No live browser checks have been performed.
