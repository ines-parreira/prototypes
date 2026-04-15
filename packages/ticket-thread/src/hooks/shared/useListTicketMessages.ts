import type { TicketMessage } from '@gorgias/helpdesk-queries'
import { useListMessages } from '@gorgias/helpdesk-queries'

import { getQueryOptions } from './queryOption'

type UseListTicketMessagesParams = {
    ticketId: number
}

export function useListTicketMessages({
    ticketId,
}: UseListTicketMessagesParams): TicketMessage[] {
    const { data: messages } = useListMessages(
        { ticket_id: ticketId },
        {
            query: {
                ...getQueryOptions(ticketId),
                select: (data): TicketMessage[] => data?.data?.data ?? [],
            },
        },
    )

    return messages ?? []
}
