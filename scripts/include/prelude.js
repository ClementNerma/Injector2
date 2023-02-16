if (query.has('noinjector')) {
	const msg = 'Injector scripts (domain + generic) disabled for this page'
	console.debug(msg)
	throw new Error(msg)
}

/**
 * Run a function anonymously
 * @param {() => void} anon
 */
function runAnonymous(anon) {
	return anon()
}

/**
 * Setup a keyboard handler function
 * @param {{ key: KeyboardEvent['key'], ctrl?: boolean, alt?: boolean, shift?: boolean }} keys
 * @param {() => void} callback
 */
async function setupKeyHandler(keys, callback) {
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
 * @param {string} fileName
 */
function sanitizeFileName(fileName) {
	return fileName.replace(/(?<!\s):\s/g, ' - ').replace(/[^a-zA-Z0-9\s\-_,;\.\(\)\[\]\{\}\!'’°#&\$\^@]/g, '_')
}

// ====== Child Script Evaluation ====== //

ambientModule.exports = {
	/**
	 * @param {string} script
	 */
	childScriptEval: (script) => eval(script),
}
