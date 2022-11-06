import { describe, expect, test } from "vitest"
import { unstore } from "svelteshareds"

import { async_validator } from "."

describe("async_validator", async () => {
	test("basic", async () => {
		const { pass } = await async_validator(
			{ name: "test" },
			{ name: [{ required: true }] }
		)

		expect(unstore(pass)).toBe(true)
	})
	test("with error", async () => {
		const { pass, error_fields } = await async_validator(
			{ name: "" },
			{ name: [{ required: true }] }
		)

		expect(unstore(pass)).toBe(false)
		expect(unstore(error_fields)?.name[0].message).toBe("name is required")
	})
	test("with custom error message", async () => {
		const { pass, error_fields } = await async_validator(
			{ name: "" },
			{ name: [{ required: true, message: "custom error" }] }
		)

		expect(unstore(pass)).toBe(false)
		expect(unstore(error_fields)?.name[0].message).toBe("custom error")
	})
})
