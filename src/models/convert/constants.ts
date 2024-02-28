import {doNotRetry40XErrorsHandler} from 'api/utils'

export const CONVERT_STALE_TIME_MS = 5 * 60 * 1000 // 5 minutes
export const CONVERT_CACHE_TIME_MS = 10 * 60 * 1000 // 10 minutes

export const CONVERT_DEFAULT_OPTIONS = {
    staleTime: CONVERT_STALE_TIME_MS,
    cacheTime: CONVERT_CACHE_TIME_MS,
    retry: doNotRetry40XErrorsHandler,
}
