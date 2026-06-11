import { Duration } from '@gorgias/toolkit'

export const STORE_MAPPINGS_QUERY_OPTIONS = {
    staleTime: Duration.hours(4),
    refetchOnWindowFocus: false,
} as const
