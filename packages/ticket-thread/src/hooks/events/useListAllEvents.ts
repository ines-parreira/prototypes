import { Duration } from '@gorgias/toolkit'
import { useExhaustEndpoint } from '@gorgias/toolkit-react'

import { listEvents, ObjectType } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

export function useListAllTicketEvents(ticketId: number) {
    return useExhaustEndpoint(
        queryKeys.events.listEvents({
            object_id: ticketId,
            object_type: ObjectType.Ticket,
        }),
        (cursor) =>
            listEvents({
                cursor,
                object_id: ticketId,
                object_type: ObjectType.Ticket,
                limit: 100,
            }),
        {
            staleTime: Duration.days(1),
            refetchOnWindowFocus: false,
        },
    )
}
