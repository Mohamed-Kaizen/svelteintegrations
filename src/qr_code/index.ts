import QRCode from "qrcode"
import { to_readable, to_writable } from "svelteshareds"

/**
 * Wrapper for qrcode.
 *
 * @param text
 * @param options
 */
export function qr_code(text: string, options?: QRCode.QRCodeToDataURLOptions) {
	const output = to_writable<string>("")
	const pending = to_writable(true)
	const error = to_writable<boolean | unknown>(false)

	async function generate() {
		pending.set(true)
		error.set(false)
		try {
			output.set(await QRCode.toDataURL(text, options))
		} catch (e) {
			error.set(e)
		}
		pending.set(false)
	}

	generate()

	return {
		output: to_readable(output),
		pending: to_readable(pending),
		error: to_readable(error),
	}
}

// alias
export { qr_code as qrCode }
