import { Duration } from '@gorgias/toolkit'

export const USER_QUERY_OPTIONS = {
    staleTime: Duration.days(1),
    refetchOnWindowFocus: false,
} as const
