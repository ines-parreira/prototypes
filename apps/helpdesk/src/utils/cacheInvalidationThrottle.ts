export type ThrottledCacheInvalidation = (() => void) & {
    cancel: () => void
}

export function createCacheInvalidationThrottle(
    callback: () => void,
    waitMs: number,
): ThrottledCacheInvalidation {
    let timeout: ReturnType<typeof setTimeout> | undefined
    let hasTrailingCall = false

    const runTrailingCall = () => {
        timeout = undefined

        if (!hasTrailingCall) {
            return
        }

        hasTrailingCall = false
        callback()
    }

    const throttled = (() => {
        if (timeout === undefined) {
            callback()
            timeout = setTimeout(runTrailingCall, waitMs)
            return
        }

        hasTrailingCall = true
    }) as ThrottledCacheInvalidation

    throttled.cancel = () => {
        if (timeout !== undefined) {
            clearTimeout(timeout)
        }

        timeout = undefined
        hasTrailingCall = false
    }

    return throttled
}
