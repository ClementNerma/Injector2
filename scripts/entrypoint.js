'use strict'

/** @typedef {Record<string, DirectoryEntry>} Directory */
/** @typedef {{ type: 'directory', content: Directory } | { type: 'file', content: string }} DirectoryEntry */

/** @returns {never} */
function fail(/** @type {string} */ message) {
	message = `Injector error: ${message}`
	alert(message)
	throw new Error(message)
}

function runAnonymous(/** @type {() => void} */ inner) {
	return inner()
}

// @ts-ignore
function require(
	/** @type {string} */ scriptPath,
	/** @type {boolean | undefined} */ isAmbientModule,
	/** @type {typeof eval} */ customEvalFn,
) {
	if (scriptsEvalFn.length !== scriptsCallTree.length) {
		fail('Number of script evaluation functions and length of call tree mismatch!')
	}

	const evalFn = scriptsEvalFn.at(-1) ?? fail('Script evaluation function was not found!')

	const script = injectorGetFile(`${scriptPath}.js`)

	if (script === null) {
		fail(`Requested module "${scriptPath}" was not found!`)
	}

	scriptsCallTree.push(canonicalizePath(scriptPath))

	const runtime = `(${__require_wrapper.toString()})(${JSON.stringify(isAmbientModule ?? false)}, ${JSON.stringify(
		script,
	)})`

	const exports = (customEvalFn ?? evalFn)(runtime)

	scriptsCallTree.pop()

	if (Reflect.ownKeys(exports).length === 0) {
		fail(`Module "${scriptPath}" did not export a single property!`)
	}

	return exports
}

function __require_wrapper(/** @type {boolean} */ isAmbientModule, /** @type {string} */ script) {
	const module = { exports: {} }
	const ambientModule = { exports: {} }

	scriptsEvalFn.push((script) => eval(script))

	eval(script)

	scriptsEvalFn.pop()

	return isAmbientModule ? ambientModule.exports : module.exports
}

function runModuleAnonymous(/** @type {{exports: {}}} */ currentModule, /** @type {() => void} */ callback) {
	currentModule.exports = { $__emptyModule: true }
	return callback()
}

function resolvePath(/** @type {string} */ path) {
	/** @type {string[]} */
	const segments = []

	const currentScript = scriptsCallTree.at(-1) ?? fail('Scripts call tree is empty!')

	for (const part of currentScript.split('/').slice(0, -1).concat(path.split('/'))) {
		if (part === '.' || part === '') {
			continue
		}

		if (part === '..') {
			if (segments.length === 0) {
				fail(`Invalid parent directory request in path: ${path}`)
			}

			segments.pop()
			continue
		}

		segments.push(part)
	}

	return segments
}

function canonicalizePath(/** @type {string} */ path) {
	return resolvePath(path).join('/')
}

function injectorGetFile(/** @type {string} */ filePath) {
	/** @type {Directory} */
	// @ts-ignore
	let intermediary = files

	const segments = resolvePath(filePath)

	const lastSegment = segments.pop() ?? fail('Cannot get file from empty path')

	for (const segment of segments) {
		if (!Object.prototype.hasOwnProperty.call(intermediary, segment)) {
			return null
		}

		const item = intermediary[segment]

		if (item.type !== 'directory') {
			return null
		}

		intermediary = item.content
	}

	if (!Object.prototype.hasOwnProperty.call(intermediary, lastSegment)) {
		return null
	}

	const file = intermediary[lastSegment]

	if (file.type !== 'file') {
		return null
	}

	return file.content
}

function injectorHasFile(/** @type {string} */ filePath) {
	return injectorGetFile(filePath) !== null
}

function injectorExpectFile(/** @type {string} */ filePath, /** @type {string | undefined} */ errorMessage) {
	const file = injectorGetFile(filePath)

	if (typeof file !== 'string') {
		fail(errorMessage ?? `Requested file "${filePath}" was not found!`)
	}

	return file
}

/** @type {string[]} */
// @ts-ignore
const scriptsCallTree = [__injectorEntrypoint]

/** @type {Array<typeof eval>} */
const scriptsEvalFn = [(script) => eval(script)]

/** @type {Directory} */
// @ts-ignore
const files = __injectorFiles

const domain = location.hostname.split('.').slice(-2).join('.')
const subdomains = location.hostname.split('.').slice(0, -2).reverse()

// @ts-ignore
const module = new Proxy(
	{ exports: {} },
	{
		get() {
			fail("Cannot access entrypoint's module")
		},
		set() {
			fail("Cannot access entrypoint's module")
		},
	},
)

console.debug('Running Injector...')

runAnonymous(async () => {
	function runDomainScript(/** @type {string} */ domain) {
		if (injectorHasFile(`${domain}.js`)) {
			const { childScriptEval: libChildScriptEval } = require('./include/lib', true)

			if (typeof libChildScriptEval !== 'function') {
				fail('Exported child script evaluation must be a function')
			}

			const { childScriptEval: preludeChildScriptEval } = require('./include/prelude', true, libChildScriptEval)

			if (typeof preludeChildScriptEval !== 'function') {
				fail('Exported child script evaluation must be a function')
			}

			console.debug(`Running domain script: ${domain}`)
			require(domain, false, preludeChildScriptEval)
		} else {
			console.debug(`Missing domain script: ${domain}`)
		}
	}

	const domainFileName =
		location.protocol === 'file:'
			? '_files'
			: subdomains.length === 1 && subdomains[0] === 'www'
			? domain
			: location.hostname

	runDomainScript('domains/_generic')
	runDomainScript(`domains/${domainFileName}`)
})
