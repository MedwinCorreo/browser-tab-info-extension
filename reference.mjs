export function formatReference(browserName, tab) {
  if (!['Chrome', 'Brave'].includes(browserName)) {
    throw new Error('Choose your browser.');
  }
  if (!Number.isInteger(tab?.id) || tab.id < 0 ||
      !Number.isInteger(tab?.windowId) || tab.windowId < 0) {
    throw new Error('Tab or window ID is unavailable. Reopen the extension on a browser tab.');
  }
  const oneLine = (value) => typeof value === 'string' && value.trim()
    ? value.replace(/[\r\n\u2028\u2029]+/g, ' ')
    : 'Unavailable';
  return `Browser: ${browserName}\nTab: ${oneLine(tab.title)}\nURL: ${oneLine(tab.url)}\nWindow ID: ${tab.windowId}\nTab ID: ${tab.id}`;
}
