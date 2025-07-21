export type IncrementalBackoffOptions = {
    initialDelay: number
    maxDelay: number
}

export default class IncrementalBackoff {
    private initialDelay: number
    private maxDelay: number
    private backoffAttempt = 1
    private timeout: NodeJS.Timeout | null = null

    constructor({ initialDelay, maxDelay }: IncrementalBackoffOptions) {
        this.initialDelay = initialDelay
        this.maxDelay = maxDelay
    }

    scheduleCall(fn: (attempt: number) => unknown) {
        if (this.timeout) {
            return
        }
        const backoff = Math.min(
            this.initialDelay * Math.pow(2, this.backoffAttempt - 1),
            this.maxDelay,
        )
        this.timeout = setTimeout(() => {
            this.clearTimeout()
            fn(this.backoffAttempt)
            this.backoffAttempt++
        }, backoff)
    }

    private clearTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout)
            this.timeout = null
        }
    }

    reset() {
        this.clearTimeout()
        this.backoffAttempt = 1
    }
}
