// Disable injector if query indicates so
if (query().has('noinjector')) {
	const msg = 'Injector scripts (domain + generic) disabled for this page'
	console.debug(msg)
	throw new Error(msg)
}

/**
 * Fail with an error message
 */
export function fail(message: string): never {
	alert(`Injector failed: ${message}`)
	throw new Error(`Injector failed: ${message}`)
}

/**
 * Check if DOM is ready
 */
export const isDOMReady = () => document.readyState === 'interactive'

/**
 * Check if page is ready
 */
export const isPageReady = () => document.readyState === 'complete'

/**
 * Select an element using a CSS selector
 */
export const q = (selector: string, inEl?: HTMLElement) =>
	_assertHtmlElementOrNull((inEl ?? document).querySelector(selector))

/**
 * Select all elements that match a CSS selector
 */
export const qa = (selector: string, inEl?: HTMLElement) =>
	Array.from((inEl ?? document).querySelectorAll(selector)).map(_assertHtmlElement)

/**
 * Get the style of an element matching a CSS selector
 */
export function styleOf(selector: string): CSSStyleDeclaration | null {
	const el = q(selector)
	return el ? el.style : null
}

/**
 * Inject a new stylesheet in the page
 */
export function css(css: string): HTMLStyleElement {
	const stylesheet = document.createElement('style')
	stylesheet.innerHTML = css

	waitFor('head').then((head) => head.appendChild(stylesheet))

	return stylesheet
}

/**
 * Wait for an element to appear
 * @returns
 */
export async function waitFor(selector: string, delayAfterDomReady = 4000, refresh = 10): Promise<HTMLElement> {
	const init = q(selector)

	if (init) {
		return Promise.resolve(init)
	}

	await domReady()

	return new Promise((resolve) => {
		const started = Date.now()

		const waiter = setInterval(() => {
			const target = q(selector)

			if (!target) {
				if (isPageReady() && Date.now() - started >= delayAfterDomReady) {
					clearInterval(waiter)
					// reject(
					// 	new Error(`No element found with selector "${selector}" after waiting delay of ${delayAfterDomReady} ms.`),
					// )
				}

				return
			}

			clearInterval(waiter)
			resolve(target)
		}, refresh)
	})
}

/**
 * Hide an element
 */
export function hide(selector: string): void {
	css(`${selector} { display: none !important; }`)
}

/**
 * Remove an element
 */
export function remove(selector: string): void {
	q(selector)?.remove()
}

/**
 * Remove all elements matching a selector
 */
export function removeAll(selector: string): void {
	for (const el of qa(selector)) {
		el.remove()
	}
}

/**
 * Click an element once it appears
 */
export function clickReady(selector: string): Promise<void> {
	return waitFor(selector).then((el) => {
		el.click()
	})
}

/**
 * Remove an element when it appears
 */
export function removeReady(selector: string): Promise<void> {
	return waitFor(selector).then((el) => {
		el.remove()
	})
}

/**
 * Hide an element and remove it when it appears
 */
export function hideAndRemove(selector: string): Promise<void> {
	hide(selector)
	return removeReady(selector)
}

/**
 * Hide and remove all elements matching a selector when they are appear (the first time only)
 */
export function hideAndRemoveAll(selector: string): Promise<void> {
	hide(selector)
	return waitFor(selector).then(() => {
		removeAll(selector)
	})
}

/**
 * Hide and remove all elements matching a selector when they are appear
 */
export function hideAndRemoveAllContinuously(selector: string, refresh = 20): void {
	hide(selector)
	setInterval(() => removeAll(selector), refresh)
}

/**
 * Run a function in parallel of the current flow
 * @returns
 */
export function parallel(callback: () => void): number {
	return setTimeout(callback, 1)
}

/**
 * Perform an action if a string matches a regular expression
 * The match's informations are provided to the callback
 * The callback return's value is returned in case of match, else `null` is returned
 */
export function matchRegex<T>(str: string, regex: RegExp, callback: (match: RegExpMatchArray) => T): T | null {
	const match = str.match(regex)
	return match ? callback(match) : null
}

/**
 * Create a DOM element
 * Attributes is a key-value object, while 'content' is either an array of elements or an HTML string
 */
export function createEl(
	tagName: string,
	attributes?: Record<string, string | number | boolean>,
	contentOrChildren?: string | HTMLElement[],
	eventListeners?: Partial<Record<keyof HTMLElementEventMap, (event: Event, self: HTMLElement) => void>>,
): HTMLElement {
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
 */
export function download(text: string, filename = 'file.txt', mimeType = 'text/plain'): void {
	const blob = new Blob([text], { type: mimeType })
	const url = window.URL.createObjectURL(blob)

	const link = createEl('a', { href: url, download: filename })
	link.click()

	window.URL.revokeObjectURL(url)
	link.remove()
}

/**
 * Download a file from an URL
 */
export function downloadUri(uri: string, filename?: string): void {
	const link = createEl('a', { href: uri, download: filename ?? '' })
	link.click()
	link.remove()
}

/**
 * Wait for the DOM to be ready
 * Useful for immediate scripts that require the DOM to be ready but do not want to wait for resources like images
 */
export async function domReady(): Promise<void> {
	if (document.readyState !== 'interactive' && document.readyState !== 'complete') {
		await new Promise((r) => window.addEventListener('DOMContentLoaded', r))
	}
}

/**
 * Wait for the document to be fully loaded
 * Useful for immediate scripts that also want to run another function
 *   only after the DOM is ready
 */
export async function pageReady(): Promise<void> {
	if (document.readyState !== 'complete') {
		await new Promise((r) => window.addEventListener('load', r))
	}
}

/**
 * Listen for events on an <input> element
 */
export async function listenInput(
	inputEl: HTMLInputElement,
	onInput: (content: string, event: Event) => void,
): Promise<void> {
	inputEl.addEventListener('input', (e) => {
		onInput(getInputValue(e), e)
	})
}

/**
 * Assert a value as being an event for an <input> or <select> element
 */
export function getInputValue(event: Event): string {
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
export function query(): URLSearchParams {
	return new URLSearchParams(window.location.search)
}

// ============ Browser utilities ============ //

/**
 * Wait for a specific condition to occurr
 * @returns
 */
export async function waitForCond(loop: () => boolean, timeout = 4000, refresh = 10): Promise<boolean> {
	const isDone = loop()

	if (isDone) {
		return true
	}

	const started = Date.now()

	return new Promise((resolve) => {
		const waiter = setInterval(() => {
			const isDone = loop()

			if (!isDone) {
				if (Date.now() - started >= timeout) {
					clearInterval(waiter)
					resolve(false)
				}

				return
			}

			clearInterval(waiter)
			resolve(true)
		}, refresh)
	})
}

// ============ Small utilities ============ //

export function trimLines(str: string): string {
	return str
		.split('\n')
		.map((line) => line.trim())
		.join('\n')
}

export function displayJson(json: Record<string, string>): void {
	console.log(JSON.stringify(json, null, 4))
}

// ============ Assertions and error management ============ //

/**
 * Ensure a value is an instanceof of a given type
 */
export function _assertType<T>(value: unknown, type: new () => T, message?: string): T {
	if (value instanceof type) {
		return value
	}

	fail(message ?? `Type assertion failed for type "${type.name ?? '<unknown>'}"`)
}

/**
 * Ensure a value is an instanceof of a given type or 'null' or 'undefined'
 */
export function _assertTypeOrNull<T>(value: unknown, type: new () => T, message?: string): T | null | undefined {
	return value === null || value === undefined ? value : _assertType(value, type, message)
}

/**
 * Ensure an Element is an HTMLElement
 */
export const _assertHtmlElement = (element: Element) =>
	_assertType(element, HTMLElement, 'Assertion error: provided Element is not an instance of HTMLElement')

/**
 * Ensure an Element | null is an HTMLElement | null
 */
export const _assertHtmlElementOrNull = (element: Element | null) =>
	element === null
		? null
		: _assertType(element, HTMLElement, 'Assertion error: provided Element is not an instance of HTMLElement')

/**
 * Assert an element as not null
 */
export function _assertNotNull<T>(value: T | null | undefined, message?: string) {
	if (value === null || value === undefined) {
		fail(message ?? 'Assertion error: provided value is null or undefined')
	}

	return value
}

/**
 * Run a function anonymously
 */
export function runAnonymous(anon: () => void) {
	return anon()
}

/**
 * Setup a keyboard handler function
 */
export function setupKeyHandler(
	keys: { key: KeyboardEvent['key']; ctrl?: boolean; alt?: boolean; shift?: boolean },
	callback: () => void,
) {
	document.addEventListener('keydown', (e) => {
		if (
			e.key === keys.key &&
			e.ctrlKey === (keys.ctrl ?? false) &&
			e.altKey === (keys.alt ?? false) &&
			e.shiftKey === (keys.shift ?? false)
		) {
			e.preventDefault()
			callback()
			return false
		}
	})
}

/**
 * Sanitize a string into as afe filename
 */
export function sanitizeFileName(fileName: string) {
	return fileName.replace(/(?<!\s):\s/g, ' - ').replace(/[^a-zA-Z0-9\s\-_,;\.\(\)\[\]\{\}\!'’°#&\$\^@]/g, '_')
}

/**
 * Ensure correct shape for domains map
 */
export function domainsMap(map: Record<string, () => Promise<void>>): typeof map {
	return map
}

/**
 * Get filename from Content-Disposition header on URL
 */
export async function fetchContentDispositionFilename(url: string): Promise<string | null> {
	const forHeaderRes = await fetch(url, { method: 'HEAD' })

	if (!forHeaderRes.ok) {
		fail(`Failed to fetch headers on URL "${url}" (status: ${forHeaderRes.status})`)
	}

	const fileDispositionHeader = forHeaderRes.headers.get('content-disposition')

	return fileDispositionHeader
		? fileDispositionHeader.match(/^attachment; filename="(.*)"$/)?.[1] ??
				fail('Filename not found in book file Content-Disposition header')
		: null
}
