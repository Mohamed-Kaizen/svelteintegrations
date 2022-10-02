import { jwt } from "."

import type { JwtHeader, JwtPayload } from "jwt-decode"

interface CustomJwtHeader extends JwtHeader {
	foo: string
}

interface CustomJwtPayload extends JwtPayload {
	foo: string
}

describe("jwt", () => {
	const encodedJwt =
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.L8i6g3PfcHlioHCCPURC9pmXT7gdJpx3kOoyAfNUwCc"

	test("decoded jwt", () => {
		const { header, payload } = jwt(encodedJwt)
		expect(header?.alg).toBe("HS256")
		// NOTE: ts-ignore can be removed as soon as jwt-decode > v3.1.2 was released
		// see: https://github.com/auth0/jwt-decode/pull/115
		// @ts-expect-error cast
		expect(header?.typ).toBe("JWT")
		expect(payload?.sub).toBe("1234567890")
		expect(payload?.iat).toBe(1516239022)
	})

	test("decode jwt error", () => {
		const onErrorSpy = vitest.fn()

		const { header, payload } = jwt("bad-token", { onError: onErrorSpy })
		expect(header).toBe(null)
		expect(payload).toBe(null)
		expect(onErrorSpy).toHaveBeenCalled()
	})

	test("decoded jwt with custom fields", () => {
		const encodedCustomJwt =
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImZvbyI6ImJhciJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJmb28iOiJiYXIifQ.S5QwvREUfgEdpB1ljG_xN6NI3HubQ79xx6J1J4dsJmg"

		const { header, payload } = jwt<CustomJwtPayload, CustomJwtHeader>(
			encodedCustomJwt
		)
		expect(header?.foo).toBe("bar")
		expect(payload?.foo).toBe("bar")
	})
})
