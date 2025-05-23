import { useMemo } from 'react'

import { listEvents } from '@gorgias/helpdesk-client'

import { useExhaustEndpoint } from 'hooks/useExhaustEndpoint'

export function useAllEvents(ticketId: number) {
    const { data, isLoading } = useExhaustEndpoint(
        ['all-events', ticketId],
        (cursor) =>
            listEvents({ cursor, object_id: ticketId, object_type: 'Ticket' }),
    )

    return useMemo(() => ({ events: data, isLoading }), [data, isLoading])
}
