import { DurationInMs } from '@repo/utils'

export const USER_QUERY_OPTIONS = {
    staleTime: DurationInMs.OneDay,
    refetchOnWindowFocus: false,
} as const
