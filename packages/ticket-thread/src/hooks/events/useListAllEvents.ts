import { useExhaustEndpoint } from '@repo/hooks'
import { DurationInMs } from '@repo/utils'

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
            staleTime: DurationInMs.OneDay,
            refetchOnWindowFocus: false,
        },
    )
}
