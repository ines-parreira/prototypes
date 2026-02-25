import { DurationInMs } from '@repo/utils'

export const getQueryOptions = (ticketId: number) => ({
    enabled: !!ticketId,
    staleTime: DurationInMs.FiveMinutes,
})
