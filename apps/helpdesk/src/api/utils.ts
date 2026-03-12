import { isAxiosError } from 'axios'

import {
    HTTP_STATUS_TOO_MANY_REQUESTS,
    QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS,
} from 'domains/reporting/models/resources'

export const reportingRetryHandler = (failureCount: number, error: unknown) => {
    if (isAxiosError(error)) {
        const statusCode = error?.response?.status

        // Retry up to 20 times for 202 (query still processing)
        if (statusCode === QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS) {
            return failureCount < 20
        }

        // Don't retry client errors (4xx except 429)
        if (
            statusCode &&
            statusCode >= 400 &&
            statusCode < 500 &&
            statusCode !== HTTP_STATUS_TOO_MANY_REQUESTS
        ) {
            return false
        }
    }

    // Default: retry up to 3 times (network errors, 429 rate limit, etc.)
    return failureCount < 3
}

/**
 * For 202 status codes that retry up to 20 times, the current exponential backoff
 * (1s → 2s → 4s → 8s → 16s capped) means:
 * Total delay over 20 retries: ~271 seconds (4.5 minutes)
 * Most retries (attempts 4-19) use the 16s cap
 */
export const reportingRetryDelayHandler = (
    retryIndex: number,
    error: unknown,
) => {
    if (isAxiosError(error)) {
        const statusCode = error?.response?.status

        // For 202: exponential backoff up to 16s
        if (statusCode === QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS) {
            return Math.min(1000 * 2 ** retryIndex, 16000)
        }
        // For other errors: exponential backoff up to 8s
        // 1s → 2s → 4s → 8s (total ~7s over 3 retries)
        return Math.min(1000 * 2 ** retryIndex, 8000)
    }

    return 1000
}

export const doNotRetry40XErrorsHandler = (
    failureCount: number,
    error: unknown,
) => {
    if (isAxiosError(error)) {
        const statusCode = error?.response?.status
        if (statusCode && statusCode >= 400 && statusCode < 500) {
            return false
        }
    }

    return failureCount < 3
}
