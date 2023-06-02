/** List of protocols the service can operate on */
const SUPPORTED_PROTOCOLS = ['http:', 'https:', 'ftp:', 'sftp:', 'file:']

chrome.tabs.onUpdated.addListener(async (tabId, _, tab) => {
	if (!tab.url) {
		console.debug('Encountered tab without URL (probably a browser internal page)')
		return
	}

	const { protocol, hostname } = new URL(tab.url)

	if (!SUPPORTED_PROTOCOLS.includes(protocol)) {
		console.debug(`Ignoring script injection for unsupported protocol "${protocol}"`)
		return
	}

	console.debug(`Matched URL "${tab.url}" as domain "${protocol === 'file:' ? 'file:///' : hostname}"`)

	chrome.scripting.executeScript({
		target: { tabId },
		injectImmediately: true,
		files: ['dist/inject.js'],
	})
})
