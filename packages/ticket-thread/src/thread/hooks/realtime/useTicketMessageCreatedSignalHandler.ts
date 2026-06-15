import { useCallback } from 'react'

import { upsertTicketMessageInListMessagesCache } from '@repo/tickets'
import type { InfiniteData } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'

import type { DomainEventWithType } from '@gorgias/events'
import { getTicketMessage } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type { ListMessages200 } from '@gorgias/helpdesk-types'

import { TICKET_THREAD_MESSAGES_PAGE_LIMIT } from '../../../ticket-messages/hooks/useListTicketMessages'

type UseTicketMessageCreatedSignalHandlerParams = {
    ticketId?: number
}

type ListAllMessagesPage = {
    data: ListMessages200
}

export function useTicketMessageCreatedSignalHandler({
    ticketId,
}: UseTicketMessageCreatedSignalHandlerParams) {
    const queryClient = useQueryClient()

    const handleTicketMessageCreatedSignal = useCallback(
        async (
            event: DomainEventWithType<'//helpdesk/ui.ticket-message.created-signal'>,
        ) => {
            if (!ticketId || event.data.ticket_id !== ticketId) {
                return
            }

            const ticketThreadMessagesQueryKey =
                queryKeys.ticketMessages.listAllMessages({
                    ticket_id: ticketId,
                    limit: TICKET_THREAD_MESSAGES_PAGE_LIMIT,
                })

            const cachedThreadMessages = queryClient.getQueryData<
                InfiniteData<ListAllMessagesPage>
            >(ticketThreadMessagesQueryKey)

            if (
                cachedThreadMessages?.pages.some((page) =>
                    page.data.data.some(
                        (cachedMessage) => cachedMessage.id === event.data.id,
                    ),
                )
            ) {
                return
            }

            const messageResponse = await queryClient.fetchQuery({
                queryKey: queryKeys.ticketMessages.getTicketMessage(
                    ticketId,
                    event.data.id,
                ),
                queryFn: () => getTicketMessage(ticketId, event.data.id),
            })

            if (!cachedThreadMessages?.pages.length) {
                return
            }

            upsertTicketMessageInListMessagesCache(
                queryClient,
                messageResponse.data,
            )
        },
        [queryClient, ticketId],
    )

    return {
        handleTicketMessageCreatedSignal,
    }
}
