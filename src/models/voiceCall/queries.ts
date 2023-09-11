import {UseQueryOptions, useQuery} from '@tanstack/react-query'

import {ListTicketVoiceCallsParams} from './types'
import {listTicketVoiceCalls} from './resources'

export const ticketVoiceCallsKeys = {
    all: () => ['ticketVoiceCalls'] as const,
    lists: () => [...ticketVoiceCallsKeys.all(), 'list'] as const,
    list: (params?: ListTicketVoiceCallsParams) => [
        ...ticketVoiceCallsKeys.lists(),
        params,
    ],
}

export const useListTicketVoiceCalls = (
    params?: ListTicketVoiceCallsParams,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof listTicketVoiceCalls>>
    >
) => {
    return useQuery({
        queryKey: ticketVoiceCallsKeys.list(params),
        queryFn: () => listTicketVoiceCalls(params),
        ...overrides,
    })
}
