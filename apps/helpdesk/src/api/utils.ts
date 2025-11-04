import axios from 'axios'

import { QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS } from 'domains/reporting/models/resources'

export const reportingRetryHandler = (failureCount: number, error: unknown) => {
    if (axios.isAxiosError(error)) {
        const statusCode = error?.response?.status
        // Retry up to 20 times if the response is not ready (202 status code)
        // This is to handle the case where the response is not ready and the query is still being processed
        if (statusCode === QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS) {
            return failureCount < 20
        }
        if (statusCode && statusCode >= 400) {
            return false
        }
    }

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
    if (axios.isAxiosError(error)) {
        const statusCode = error?.response?.status
        if (statusCode === QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS) {
            return Math.min(1000 * 2 ** retryIndex, 16000)
        }
    }
    return 1000
}

export const doNotRetry40XErrorsHandler = (
    failureCount: number,
    error: unknown,
) => {
    if (axios.isAxiosError(error)) {
        const statusCode = error?.response?.status
        if (statusCode && statusCode >= 400 && statusCode < 500) {
            return false
        }
    }

    return failureCount < 3
}
