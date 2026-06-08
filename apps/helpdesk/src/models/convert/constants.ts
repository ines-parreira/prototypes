import { doNotRetry40XErrorsHandler } from '@repo/api-resources'
import { Duration } from '@gorgias/toolkit'

export const CONVERT_STALE_TIME_MS = Duration.minutes(5)
export const CONVERT_CACHE_TIME_MS = Duration.minutes(10)

export const CONVERT_DEFAULT_OPTIONS = {
    staleTime: CONVERT_STALE_TIME_MS,
    cacheTime: CONVERT_CACHE_TIME_MS,
    retry: doNotRetry40XErrorsHandler,
}
