/* istanbul ignore file */
import { QueryCache, QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

export const queryCache = new QueryCache()

const HTTP_STATUS_TO_NOT_RETRY = [400, 401, 403, 404, 419, 429]

const isRetriable = (retryIndex: number, error: unknown) => {
    if (
        isAxiosError(error) &&
        !!error.response?.status &&
        HTTP_STATUS_TO_NOT_RETRY.includes(error.response.status)
    ) {
        return false
    }

    return retryIndex < 4
}

export const appQueryClient = new QueryClient({
    queryCache,
    defaultOptions: {
        queries: {
            retry: (retryIndex, error) => isRetriable(retryIndex, error),
            /**
             * 1st failure: 2000ms (2 seconds)
             * 2nd failure: 4000ms (4 seconds)
             * 3rd failure: 8000ms (8 seconds)
             * 4th failure: 16000ms (16 seconds)
             * 5th failure: 32000ms (32 seconds)
             */
            retryDelay: (retryIndex) => Math.min(1000 * 2 ** retryIndex, 30000),
        },
    },
})
