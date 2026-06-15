import { useCallback, useRef } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { Button, toast } from '@gorgias/axiom'
import type { DomainEvent } from '@gorgias/events'
import { isDomainEvent } from '@gorgias/events'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { TICKET_THREAD_MESSAGES_PAGE_LIMIT } from '../../../ticket-messages/hooks/useListTicketMessages'
import { useTicketMessageCreatedSignalHandler } from './useTicketMessageCreatedSignalHandler'

type UseRealtimeTicketUpdatesParams = {
    ticketId?: number
}

export function useRealtimeTicketUpdates({
    ticketId,
}: UseRealtimeTicketUpdatesParams) {
    const queryClient = useQueryClient()
    const processedEvents = useRef<Set<string>>(new Set())
    const { handleTicketMessageCreatedSignal } =
        useTicketMessageCreatedSignalHandler({
            ticketId,
        })

    const handleTicketUpdateEvents = useCallback(
        (event: DomainEvent) => {
            if (
                !ticketId ||
                !isDomainEvent(
                    event,
                    '//helpdesk/ui.ticket-message.created-signal',
                ) ||
                processedEvents.current.has(event.id)
            ) {
                return
            }

            processedEvents.current.add(event.id)
            void handleTicketMessageCreatedSignal(event).catch(() => {
                processedEvents.current.delete(event.id)
                toast.error('Failed to fetch latest message(s).', {
                    actions: ({ id }) => (
                        <Button
                            size="sm"
                            variant="tertiary"
                            onClick={() => {
                                toast.dismiss(id)
                                void queryClient.refetchQueries({
                                    queryKey:
                                        queryKeys.ticketMessages.listAllMessages(
                                            {
                                                ticket_id: ticketId,
                                                limit: TICKET_THREAD_MESSAGES_PAGE_LIMIT,
                                            },
                                        ),
                                })
                            }}
                        >
                            Refetch ticket thread
                        </Button>
                    ),
                })
            })
        },
        [handleTicketMessageCreatedSignal, queryClient, ticketId],
    )

    return {
        handleTicketUpdateEvents,
    }
}
