/** @typedef {Record<string, DirectoryEntry>} Directory */
/** @typedef {{ type: 'directory', content: Directory } | { type: 'file', content: string }} DirectoryEntry */

/**
 * @param {string} dir,
 * @param {string} rootDir,
 * @param {string[] | undefined} exclude,
 * @returns {Directory}
 */
function buildDirJson(dir, rootDir) {
	return Object.fromEntries(
		fs.readdirSync(dir)
			.filter((item) => !item.startsWith('.'))
			.map((item) => {
				const itemPath = path.join(dir, item)

				/** @type {DirectoryEntry} */
				const content = fs.lstatSync(itemPath).isDirectory()
					? { type: 'directory', content: buildDirJson(itemPath, rootDir) }
					: { type: 'file', content: fs.readFileSync(itemPath, 'utf8') }

				return [item, content]
			}),
	)
}

const fs = require('fs')
const path = require('path')

if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist')
}

const rootDir = path.join(process.cwd(), 'scripts')
const json = JSON.stringify(buildDirJson(rootDir, rootDir))

fs.writeFileSync('dist/scripts.json', json)

console.info('Successfully built!')
