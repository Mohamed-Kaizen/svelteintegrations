import jwt_decode from "jwt-decode"

import type { JwtDecodeOptions, JwtHeader, JwtPayload } from "jwt-decode"

export interface JwtOptions<Fallback> {
	/**
	 * Value returned when encounter error on decoding
	 *
	 * @default null
	 */
	fallback_value?: Fallback

	/**
	 * Error callback for decoding
	 */
	on_error?: (error: unknown) => void
}

export interface JwtReturn<Payload, Header, Fallback> {
	header: Header | Fallback
	payload: Payload | Fallback
}

/**
 *
 * @param jwt
 */
export function jwt<
	Payload extends object = JwtPayload,
	Header extends object = JwtHeader,
	Fallback = null
>(
	encoded_jwt: string,
	options: JwtOptions<Fallback> = {}
): JwtReturn<Payload, Header, Fallback> {
	const { on_error, fallback_value = null } = options

	const decode_with_fallback = <T extends object>(
		encoded_jwt: string,
		options?: JwtDecodeOptions
	): T | Fallback => {
		try {
			return jwt_decode<T>(encoded_jwt, options)
		} catch (err) {
			on_error?.(err)
			return fallback_value as Fallback
		}
	}

	const header = decode_with_fallback<Header>(encoded_jwt, { header: true })

	const payload = decode_with_fallback<Payload>(encoded_jwt)

	return {
		header,
		payload,
	}
}
