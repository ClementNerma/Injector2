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
function buildDirJson(dir, rootDir) {
	return Object.fromEntries(
		readdirSync(dir)
			.filter((item) => !item.startsWith('.'))
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

const app = express()
const dir = process.argv[2]
const port = parseInt(process.argv[3] ?? '1235')

if (Number.isNaN(port)) {
	throw new Error('Please provide a valid port number')
}

const rootDir = join(process.cwd(), dir)

app.get('/', (_, res) => {
	res.type('json')
	res.send(JSON.stringify(buildDirJson(rootDir, rootDir)))
})

console.log(`Running server on port ${port}`)
app.listen(port)
