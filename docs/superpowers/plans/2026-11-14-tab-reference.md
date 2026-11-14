# Tab Reference Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Copy a readable reference to the active Chrome or Brave tab for sharing with a coding agent.

**Architecture:** A Manifest V3 popup queries the active tab once when opened and shows a text preview. A remembered, user-selected browser name accompanies the browser-provided fields; a button copies the preview. No background process or agent connection is needed.

**Tech Stack:** Plain HTML/CSS, JavaScript modules, Chromium extension APIs, Node's built-in test runner.

**Spec:** [Approved design and proposed implementation decisions](../specs/2026-11-14-tab-reference-design.md).

## Global Constraints

- Support Chrome and Brave.
- Button copy: **Copy tab reference**.
- Output fields, in order: `Browser`, `Tab`, `URL`, `Window ID`, `Tab ID`.
- No dependencies, build step, content scripts, background worker, host permissions, network requests, or agent integration.
- Browser selection is a proposed implementation decision requiring user review before implementation.
- Do not commit unless the user requests a commit.

## Review Focus

- Browser name is unselected or stored data is invalid: require Chrome/Brave selection; do not guess.
- Active tab lookup rejects or returns no tab: disable copying and explain the failure.
- IDs are missing, negative, or nonintegral: do not produce a misleading reference; zero is valid.
- Title/URL are absent or contain unusual text: use `Unavailable` for missing values, preserve Unicode, and display text without HTML interpretation.
- Clipboard writing rejects: retain the selectable preview and never announce success.

## File Structure

- `manifest.json`: Manifest V3, action popup, `activeTab` permission only.
- `popup.html`: accessible browser selector, preview, copy button, and live status.
- `popup.css`: small, readable popup with wrapping and visible focus.
- `popup.mjs`: load saved label, query tab, render preview, and handle copying/errors.
- `reference.mjs`: validate fields and format the reference independently of the DOM.
- `tests/reference.test.mjs`: built-in Node tests for formatting/validation.
- `tests/popup.test.mjs`: minimal browser/DOM stubs for lookup and clipboard failure paths.
- `README.md`: install, use, checks, and identifier limitations.

### Task 1: Deliver the copy-reference extension

**Files:** Create the implementation/test files listed above; update `README.md`.

**Interfaces:**
- `reference.mjs` exports `formatReference(browserName, tab) -> string`.
- `browserName` must be `Chrome` or `Brave`; `tab` contains `id`, `windowId`, optional `title`, and optional `url`.
- Invalid names/IDs throw an explanatory error; valid fields produce the spec's exact five-line format.
- `popup.mjs` consumes the formatter, `chrome.tabs.query({ active: true, currentWindow: true })`, extension-page `localStorage`, and `navigator.clipboard.writeText(preview)`.

- [x] **Step 1: Write formatter tests.** Assert exact output for a Brave tab with IDs 456/123; assert missing title/URL become `Unavailable`; assert Unicode is preserved and embedded line breaks are flattened so fields cannot imitate other output fields; accept zero IDs; reject missing, negative, fractional IDs and unknown browser labels.
- [x] **Step 2: Run `node --test tests/reference.test.mjs`.** Confirm failure because the formatter does not exist.
- [x] **Step 3: Implement `formatReference(browserName, tab)` in `reference.mjs`.** Validate IDs with `Number.isInteger` and `>= 0`; normalize line breaks in title/URL to spaces; emit the exact field order from the spec.
- [x] **Step 4: Run the formatter tests.** All assertions must pass.
- [x] **Step 5: Write popup behavior tests.** Use minimal DOM/browser stubs and import the popup module; assert lookup rejection/empty results disable copying, invalid saved labels require selection, selecting a name updates the preview, successful copying writes exactly the preview and reports success, and rejected clipboard writing retains the preview without reporting success.
- [x] **Step 6: Run `node --test tests/popup.test.mjs`.** Confirm failure because the popup module does not exist.
- [x] **Step 7: Implement the manifest and popup.** External module script only; initialize a disabled copy button, read the stored browser label defensively, query the active tab once, and render with `.value`/`.textContent`. Persist valid label changes with `localStorage`; handle storage failure without blocking this copy. Use a labeled read-only textarea and an `aria-live` status. Clipboard writing occurs directly from the copy-button handler, with success set only after it resolves. No clipboard-read permission.
- [x] **Step 8: Run `node --test tests/*.test.mjs` and `git diff --check`.** Both must pass. Parse `manifest.json` with Node and check that its popup/script/style references exist.
- [x] **Step 9: Update `README.md`.** Explain loading the project folder unpacked via `chrome://extensions` or `brave://extensions`, pinning the extension, selecting browser name, and copying a reference. Document snapshot/session scope, independent browser/profile ID collisions, restricted-page metadata, and that agent tools may use different identifiers. Include the test command.
- [ ] **Step 10: Verify in Chrome and Brave where available.** Load unpacked, open two windows and multiple tabs, and compare each preview with the selected tab. Copy/paste the exact text, close/reopen to verify the saved browser label and refreshed tab, test keyboard access and long/Unicode titles, and check restricted pages fail gracefully. Do not claim browser checks that could not be performed.

## Handoff

Recommend native execution for this single small task. Review the remembered browser-selector proposal before implementation. No code has been created or live browser behavior verified as part of planning.

## Execution status

Implemented on `feat/tab-reference` after the user said “continue.” Automated checks: 10 tests pass; manifest and referenced popup files validate. Live Chrome launch aborted before loading the extension (SIGABRT; process cleanup reported EPERM). Chrome/Brave popup, clipboard, keyboard, and multi-window checks remain unverified. No commits or pushes were made.
