import { readdir } from "fs/promises"
import fs from "fs-extra"
import fg from "fast-glob"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const DIR_ROOT = path.resolve(__dirname, "../")
export const DIR_SRC = path.resolve(DIR_ROOT, "src")

export function group(list, fn) {
	return list.reduce((acc, item) => {
		const id = fn(item)
		const groupList = acc[id] ?? []
		return { ...acc, [id]: [...groupList, item] }
	}, {})
}

export async function list_functions(dir, ignore = []) {
	let files = await fg("*", {
		onlyDirectories: true,
		cwd: dir,
		ignore: ["_*", "dist", "node_modules", ...ignore],
	})

	files.sort()

	const index = []

	await Promise.all(
		files.map(async (name) => {
			const tsPath = path.join(DIR_SRC, name, "index.ts")

			index.push({
				name: name,
				path: tsPath,
				module: name,
			})
		})
	)

	const functions = { ...group(index, (f) => f.module) }

	return functions
}

export async function updatePackageJSON(exports) {
	const packageJSONPath = path.join(DIR_ROOT, "package.json")

	const pkg = await fs.readJSON(packageJSONPath)

	pkg.exports = exports

	await fs.writeJSON(packageJSONPath, pkg, { spaces: 4 })
}

export async function gitignore() {
	let files = await fg("*", {
		onlyDirectories: true,
		cwd: DIR_SRC,
		ignore: ["_*", "dist", "node_modules"],
	})

	const _files = files.map((f) => `/${f}`)

	for (const file of files) {
		_files.push(`${file}.js`)
		_files.push(`${file}.cjs`)
	}

	const gitignorePath = path.join(DIR_ROOT, ".gitignore")

	const gitignore = await fs.readFile(gitignorePath, "utf-8")

	const lines = gitignore.split("\n")

	const newLines = lines.filter((line) => {
		return !_files.includes(line)
	})

	await fs.writeFile(gitignorePath, [...newLines, ..._files].join("\n"))
}

export async function clear() {
	let files = await fg("*", {
		onlyDirectories: true,
		cwd: DIR_SRC,
		ignore: ["_*", "dist", "node_modules"],
	})
	for (const file of files) {
		const filepath = path.join(DIR_ROOT, file)
		await fs.remove(filepath)
		await fs.remove(`${filepath}.js`)
		await fs.remove(`${filepath}.cjs`)
	}
}
