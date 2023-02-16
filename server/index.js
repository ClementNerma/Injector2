import { readdirSync, lstatSync, readFileSync } from 'fs'
import { join } from 'path'
import express from 'express'

/** @typedef {Record<string, DirectoryEntry>} Directory */
/** @typedef {{ type: 'directory', content: Directory } | { type: 'file', content: string }} DirectoryEntry */

/**
 * @param {string} dir,
 * @param {string} rootDir,
 * @param {string[] | undefined} exclude,
 * @returns {Directory}
 */
function buildDirJson(dir, rootDir, exclude) {
	return Object.fromEntries(
		readdirSync(dir)
			.filter((item) => !(Boolean(exclude?.includes(item)) || item.startsWith('.')))
			.map((item) => {
				const itemPath = join(dir, item)

				/** @type {DirectoryEntry} */
				const content = lstatSync(itemPath).isDirectory()
					? { type: 'directory', content: buildDirJson(itemPath, rootDir) }
					: { type: 'file', content: readFileSync(itemPath, 'utf8') }

				return [item, content]
			}),
	)
}

const rootDir = process.cwd()

const app = express()
const port = parseInt(process.argv[2])

if (Number.isNaN(port)) {
	throw new Error('Please provide a valid port number')
}

app.get('/', (_, res) => {
	res.type('json')
	res.send(JSON.stringify(buildDirJson(rootDir, rootDir, ['_server'])))
})

console.log(`Running server on port ${port}`)
app.listen(port)
