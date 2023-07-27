const MAX_SIZE_IN_MB = 1

export class PayloadSizeLimitError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'PayloadSizeLimitError'
    }
}
export const SIZE_LIMIT_ERROR = `Sorry, your flow couldn't be saved because it's too big`

export function verifyPayloadSize<T>(payload: T): T {
    if (
        new TextEncoder().encode(JSON.stringify(payload)).length >
        MAX_SIZE_IN_MB * 1024 * 1024
    ) {
        throw new PayloadSizeLimitError(SIZE_LIMIT_ERROR)
    }
    return payload
}
