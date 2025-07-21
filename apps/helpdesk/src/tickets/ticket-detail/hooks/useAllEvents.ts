import { useMemo } from 'react'

import { listEvents } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { useExhaustEndpoint } from 'hooks/useExhaustEndpoint'

import { TICKET_QUERIES_DEFAULT_CONFIG } from '../constants'

export function useAllEvents(ticketId: number) {
    const queryParams = {
        object_id: ticketId,
        object_type: 'Ticket',
        limit: 100,
    } as const

    const { data, isLoading } = useExhaustEndpoint(
        queryKeys.events.listEvents(queryParams),
        (cursor) => listEvents({ cursor, ...queryParams }),
        TICKET_QUERIES_DEFAULT_CONFIG,
    )

    return useMemo(() => ({ events: data, isLoading }), [data, isLoading])
}
