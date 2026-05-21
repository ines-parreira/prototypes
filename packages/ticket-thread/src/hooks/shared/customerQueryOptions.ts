import { DurationInMs } from '@repo/utils'

export const customerGetQueryOptions = {
    staleTime: DurationInMs.OneDay,
    cacheTime: DurationInMs.OneDay,
} as const
