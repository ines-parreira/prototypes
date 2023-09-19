const MAX_SIZE_IN_MB = 1

export class PayloadSizeLimitError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'PayloadSizeLimitError'
    }
}
export const SIZE_LIMIT_ERROR = `Your flow couldn't be saved because it's too large. Please delete some steps and try again.`

export function verifyPayloadSize<T>(payload: T): T {
    if (
        new TextEncoder().encode(JSON.stringify(payload)).length >
        MAX_SIZE_IN_MB * 1024 * 1024
    ) {
        throw new PayloadSizeLimitError(SIZE_LIMIT_ERROR)
    }
    return payload
}
