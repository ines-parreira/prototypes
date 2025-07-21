import axios from 'axios'

export const doNotRetry40xAnd5xxErrors = (
    failureCount: number,
    error: unknown,
) => {
    if (axios.isAxiosError(error)) {
        const statusCode = error?.response?.status
        if (statusCode && statusCode >= 400) {
            return false
        }
    }

    return failureCount < 3
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
