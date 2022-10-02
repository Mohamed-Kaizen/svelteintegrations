import { build } from "vite"
import fs from "fs-extra"
import path from "path"
import { fileURLToPath } from "url"

import { list_functions, updatePackageJSON, gitignore } from "./utils.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DIR_ROOT = path.resolve(__dirname, "../")
const DIR_SRC = path.resolve(DIR_ROOT, "src")

async function run() {
	const functions = await list_functions(DIR_SRC)

	const modules = Object.keys(functions)

	const libraries = []

	const pkgExports = {}

	for (const module of modules) {
		libraries.push({
			entry: path.resolve(__dirname, `../src/${module}/index.ts`),
			fileName: module,
		})

		pkgExports[`./${module}`] = {
			import: `./${module}.js`,
			require: `./${module}.cjs`,
		}
	}

	libraries.forEach(async (lib) => {
		await build({
			build: {
				outDir: "./",
				lib: {
					...lib,
					formats: ["es", "cjs"],
				},
				emptyOutDir: false,
			},
		})
	})

	await gitignore()

	await updatePackageJSON(pkgExports)
}

run()
