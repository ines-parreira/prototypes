import { Duration } from '@gorgias/toolkit'

export const TICKET_QUERIES_DEFAULT_CONFIG = {
    staleTime: Duration.minutes(1),
    refetchOnWindowFocus: false,
}
