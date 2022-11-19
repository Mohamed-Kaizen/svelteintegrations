import Fuse from "fuse.js"

export type _FuseOptions<T> = Fuse.IFuseOptions<T>

export interface FuseOptions<T> {
	/**
	 * Fuse.js options
	 */
	fuse_options?: _FuseOptions<T>
	/**
	 * Number of results to return
	 */
	limit?: number
	/**
	 * Match all results when search term is empty
	 */
	match_when_empty?: boolean
}

export function fuse<T>(search: string, data: T[], options: FuseOptions<T>) {
	const { fuse_options, limit, match_when_empty } = options

	const fuse_instance = new Fuse(data ?? [], fuse_options)

	let results

	if (match_when_empty && !search)
		results = data.map((item, index) => ({ item, refIndex: index }))
	else results = fuse_instance.search(search, limit ? { limit } : undefined)

	return {
		results,
		ifuse: fuse_instance,
	}
}
