import { Duration } from '@gorgias/toolkit'

export const getQueryOptions = (ticketId: number) => ({
    enabled: !!ticketId,
    staleTime: Duration.minutes(5),
})
