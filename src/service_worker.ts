/** List of protocols the service can operate on */
const SUPPORTED_PROTOCOLS = ['http', 'https', 'ftp', 'sftp', 'file']

chrome.tabs.onUpdated.addListener(async (tabId, _, tab) => {
	if (!tab.url) {
		console.debug('Encountered tab without URL (probably a browser internal page)')
		return
	}

	const match = tab.url.match(/^([a-zA-Z]+):\/\/\/?([^\/]+)(?=$|\/.*$)/)

	if (!match) {
		console.debug(`Failed to parse domain name for URL: ${tab.url} (probably an internal URL)`)
		return
	}

	const [, protocol, _domain] = match

	if (!SUPPORTED_PROTOCOLS.includes(protocol)) {
		console.debug(`Ignoring script injection for unsupported protocol "${protocol}"`)
		return
	}

	// Special handling for local files
	const domain = protocol === 'file' ? '_files' : _domain

	console.debug(`Matched URL "${tab.url}" as domain "${domain}"`)

	// const beforeFetching = Date.now()

	chrome.scripting.executeScript({
		target: { tabId },
		injectImmediately: true,
		files: ['dist/inject.js'],
	})

	console.debug(`Injected script for domain "${domain}"`)
})
