/* istanbul ignore file */
import {QueryCache, QueryClient} from '@tanstack/react-query'
import {isAxiosError} from 'axios'

export const queryCache = new QueryCache()

const HTTP_STATUS_TO_NOT_RETRY = [401, 403, 404, 419, 429]

const isRetryable = (error: unknown) => {
    if (
        isAxiosError(error) &&
        !!error.response?.status &&
        HTTP_STATUS_TO_NOT_RETRY.includes(error.response.status)
    ) {
        return false
    }

    return true
}

export const appQueryClient = new QueryClient({
    queryCache,
    defaultOptions: {
        queries: {
            retry: (_, error) => isRetryable(error),
        },
        mutations: {
            retry: (_, error) => isRetryable(error),
        },
    },
})
