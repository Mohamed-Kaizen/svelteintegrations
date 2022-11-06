import Schema from "async-validator"
import { to_readable, to_writable } from "svelteshareds"

import type { Rules, ValidateError, ValidateOption } from "async-validator"
import type { Readable } from "svelte/store"

export type AsyncValidatorError = Error & {
	errors: ValidateError[]
	fields: Record<string, ValidateError[]>
}

export interface AsyncValidatorReturn {
	pass: Readable<boolean>

	error_info: Readable<AsyncValidatorError | null>

	finished: Readable<boolean>

	errors: Readable<AsyncValidatorError["errors"] | undefined>

	error_fields: Readable<AsyncValidatorError["fields"] | undefined>
}

/**
 * Wrapper for async-validator.
 *
 * @see https://github.com/yiminghe/async-validator
 */

export function async_validator(
	value: Record<string, unknown>,
	rules: Rules,
	options: ValidateOption = {}
): AsyncValidatorReturn {
	const error_info = to_writable<AsyncValidatorError | null>(null)

	const finished = to_writable(false)

	const pass = to_writable(false)

	const errors = to_writable<AsyncValidatorError["errors"] | undefined>(
		undefined
	)

	const error_fields = to_writable<AsyncValidatorError["fields"] | undefined>(
		undefined
	)

	async function validate() {
		finished.set(false)

		pass.set(false)

		const validator = new Schema(rules)

		try {
			await validator.validate(value, options)

			pass.set(true)

			error_info.set(null)

			errors.set(undefined)

			error_fields.set(undefined)
		} catch (error) {
			const err = error as AsyncValidatorError

			error_info.set(err)

			errors.set(err?.errors)

			error_fields.set(err?.fields)
		} finally {
			finished.set(true)
		}
	}

	validate()

	return {
		pass: to_readable(pass),
		error_info: to_readable(error_info),
		finished: to_readable(finished),
		errors: to_readable(errors),
		error_fields: to_readable(error_fields),
	}
}

// alias
export { async_validator as AsyncValidator }
