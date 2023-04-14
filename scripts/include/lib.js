'use strict'

/**
 * Check if DOM is ready
 */
const isDOMReady = () => document.readyState === 'interactive'

/**
 * Check if page is ready
 */
const isPageReady = () => document.readyState === 'complete'

/**
 * Select an element using a CSS selector
 * @param {string} selector
 * @returns
 */
const q = (selector) => _assertHtmlElementOrNull(document.querySelector(selector))

/**
 * Select all elements that match a CSS selector
 * @param {string} selector
 * @returns
 */
const qa = (selector) => Array.from(document.querySelectorAll(selector)).map(_assertHtmlElement)

/**
 * Get the style of an element matching a CSS selector
 * @param {string} selector
 * @returns
 */
function styleOf(selector) {
	const el = q(selector)
	return el ? el.style : null
}

/**
 * Inject a new stylesheet in the page
 * @param {string} css
 */
function css(css) {
	const stylesheet = document.createElement('style')
	stylesheet.innerHTML = css
	waitFor('head', (head) => head.appendChild(stylesheet))
}

/**
 * Wait for an element to appear
 * @param {string} selector
 * @param {(el: HTMLElement, time: number) => void} callback
 * @param {number} delayAfterDomReady
 * @param {number} refresh
 * @returns
 */
async function waitFor(selector, callback, delayAfterDomReady = 4000, refresh = 10) {
	const init = q(selector)

	if (init) {
		callback(init, 0)
		return
	}

	await domReady()

	const started = Date.now()

	const waiter = setInterval(() => {
		const target = q(selector)

		if (!target) {
			if (isPageReady() && Date.now() - started >= delayAfterDomReady) {
				clearInterval(waiter)
			}

			return
		}

		clearInterval(waiter)
		callback(target, Date.now() - started)
	}, refresh)
}

/**
 * Hide an element
 * @param {string} selector
 */
function hide(selector) {
	css(`${selector} { display: none !important; }`)
}

/**
 * Remove an element
 * @param {string} selector
 */
function remove(selector) {
	q(selector)?.remove()
}

/**
 * Remove all elements matching a selector
 * @param {string} selector
 */
function removeAll(selector) {
	qa(selector).forEach((el) => el.remove())
}

/**
 * Click an element once it appears
 * @param {string} selector
 * @param {() => void} callback
 */
function clickReady(selector, callback) {
	waitFor(selector, (el) => {
		el.click()
		callback?.()
	})
}

/**
 * Remove an element when it appears
 * @param {string} selector
 * @param {() => void} [callback]
 */
function removeReady(selector, callback) {
	waitFor(selector, (el) => {
		el.remove()
		callback?.()
	})
}

/**
 * Hide an element and remove it when it appears
 * @param {string} selector
 * @param {() => void} [callback]
 */
function hideAndRemove(selector, callback) {
	hide(selector)
	removeReady(selector, callback)
}

/**
 * Hide and remove all elements matching a selector when they are appear (the first time only)
 * @param {string} selector
 * @param {() => void} callback
 */
function hideAndRemoveAll(selector, callback) {
	hide(selector)
	waitFor(selector, (_) => {
		removeAll(selector)
		callback?.()
	})
}

/**
 * Hide and remove all elements matching a selector when they are appear
 * @param {string} selector
 * @param {number} refresh
 */
function hideAndRemoveAllContinuously(selector, refresh = 20) {
	hide(selector)
	setInterval(() => removeAll(selector), refresh)
}

/**
 * Run a function in parallel of the current flow
 * @param {() => void} callback
 * @returns
 */
function parallel(callback) {
	return setTimeout(callback, 1)
}

/**
 * Perform an action if a string matches a regular expression
 * The match's informations are provided to the callback
 * The callback return's value is returned in case of match, else `null` is returned
 *
 * @template T
 * @param {string} str
 * @param {RegExp} regex
 * @param {(match: RegExpMatchArray) => T} callback
 */
function matchRegex(str, regex, callback) {
	const match = str.match(regex)
	return match ? callback(match) : null
}

/**
 * Create a DOM element
 * Attributes is a key-value object, while 'content' is either an array of elements or an HTML string
 *
 * @param {string} tagName
 * @param {Record<string, string | number | boolean>} [attributes]
 * @param {string | HTMLElement[]} [contentOrChildren]
 * @param {Partial<Record<keyof HTMLElementEventMap, (event: Event, self: HTMLElement) => void>>} [eventListeners]
 * @returns
 */
function createEl(tagName, attributes, contentOrChildren, eventListeners) {
	const el = document.createElement(tagName)

	if (attributes) {
		for (const [name, value] of Object.entries(attributes)) {
			if (value === false) {
				continue
			}

			el.setAttribute(name, value.toString())
		}
	}

	if (typeof contentOrChildren === 'string') {
		el.innerText = contentOrChildren
	} else if (Array.isArray(contentOrChildren)) {
		for (const child of contentOrChildren) {
			el.appendChild(child)
		}
	} else if (contentOrChildren !== undefined && contentOrChildren !== null) {
		fail('Unsupported content type provided to "createEl" function')
	}

	if (eventListeners) {
		for (const [eventName, listener] of Object.entries(eventListeners)) {
			el.addEventListener(eventName, (e) => listener(e, el))
		}
	}

	return el
}

/**
 * Download an in-memory buffer to a file
 * @param {string} text
 * @param {string} filename
 * @param {string} mimeType
 */
function download(text, filename = 'file.txt', mimeType = 'text/plain') {
	const blob = new Blob([text], { type: mimeType })
	const url = window.URL.createObjectURL(blob)

	const link = document.createElement('a')
	link.setAttribute('href', url)
	link.setAttribute('download', filename)

	link.click()

	window.URL.revokeObjectURL(url)
	link.remove()
}

/**
 * Wait for the DOM to be ready
 * Useful for immediate scripts that require the DOM to be ready but do not want to wait for resources like images
 */
async function domReady() {
	if (document.readyState !== 'interactive' && document.readyState !== 'complete') {
		await new Promise((r) => window.addEventListener('DOMContentLoaded', r))
	}
}

/**
 * Wait for the document to be fully loaded
 * Useful for immediate scripts that also want to run another function
 *   only after the DOM is ready
 */
async function pageReady() {
	if (document.readyState !== 'complete') {
		await new Promise((r) => window.addEventListener('load', r))
	}
}

/**
 * Listen for events on an <input> element
 * @param {HTMLInputElement} inputEl
 * @param {(content: string, event: Event) => void} onInput
 */
async function listenInput(inputEl, onInput) {
	inputEl.addEventListener('input', (e) => {
		onInput(getInputValue(e), e)
	})
}

/**
 * Assert a value as being an event for an <input> or <select> element
 * @param {Event} event
 * @returns {string}
 */
function getInputValue(event) {
	if (!event.currentTarget) {
		fail('No current target in <input> element\'s "input" event')
	}

	if (!('value' in event.currentTarget && typeof event.currentTarget.value === 'string')) {
		fail('Failed to retrieve value from <input> element\'s "input" event')
	}

	return event.currentTarget.value
}

/**
 * Get the current URL's query parameters and/or update it
 */
const query = new URLSearchParams(window.location.search)

// ============ Browser utilities ============ //

/**
 * Wait for a specific condition to occurr
 * @param {() => boolean} loop
 * @param {number} timeout
 * @param {number} refresh
 * @returns
 */
async function waitForCond(loop, timeout = 4000, refresh = 10) {
	const isDone = loop()

	if (isDone) {
		return
	}

	const started = Date.now()

	const waiter = setInterval(() => {
		const isDone = loop()

		if (isDone) {
			if (Date.now() - started >= timeout) {
				clearInterval(waiter)
			}

			return
		}

		clearInterval(waiter)
	}, refresh)
}

// ============ Small utilities ============ //

/**
 * @template {object} T
 * @template {string} K
 *
 * @param {T} obj
 * @param {K} key
 * @returns {K is keyof T}
 */
const isKeyInObj = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)

/**
 * @param {string} str
 */
const trimLines = (str) =>
	str
		.split('\n')
		.map((line) => line.trim())
		.join('\n')

/**
 * @param {Record<string, string>} json
 */
const displayJson = (json) => console.log(JSON.stringify(json, null, 4))

// ============ Assertions and error management ============ //

/**
 * Ensure a value is an instanceof of a given type
 *
 * @template T
 * @param {unknown} value
 * @param {new() => T} type
 * @param {string | undefined} [message]
 * @returns {T}
 */
function _assertType(value, type, message) {
	if (value instanceof type) {
		return value
	}

	fail(message ?? `Type assertion failed for type "${type.name ?? '<unknown>'}"`)
}

/**
 * Ensure a value is an instanceof of a given type or 'null' or 'undefined'
 *
 * @template T
 * @param {unknown} value
 * @param {new() => T} type
 * @param {string} [message]
 * @returns {T | null | undefined}
 */
const _assertTypeOrNull = (value, type, message) =>
	value === null || value === undefined ? value : _assertType(value, type, message)

/**
 * Ensure an Element is an HTMLElement
 * @param {Element} element
 */
const _assertHtmlElement = (element) =>
	_assertType(element, HTMLElement, 'Assertion error: provided Element is not an instance of HTMLElement')

/**
 * Ensure an Element | null is an HTMLElement | null
 * @param {Element | null} element
 */
const _assertHtmlElementOrNull = (element) =>
	element === null
		? null
		: _assertType(element, HTMLElement, 'Assertion error: provided Element is not an instance of HTMLElement')

/**
 * Assert an element as not null
 * @template T
 * @param {T | null | undefined} value
 * @param {string | undefined} [message]
 */
function _assertNotNull(value, message) {
	if (value === null || value === undefined) {
		fail(message ?? 'Assertion error: provided value is null or undefined')
	}

	return value
}

// ====== Child Script Evaluation ====== //

ambientModule.exports = {
	/**
	 * @param {string} script
	 */
	childScriptEval: (script) => eval(script),
}
