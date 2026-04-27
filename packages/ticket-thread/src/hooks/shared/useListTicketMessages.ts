import type { TicketMessage } from '@gorgias/helpdesk-queries'
import { useListAllMessages } from '@gorgias/helpdesk-queries'

type UseListTicketMessagesParams = {
    ticketId: number
}

export const TICKET_THREAD_MESSAGES_PAGE_LIMIT = 100

export function useListTicketMessages({
    ticketId,
}: UseListTicketMessagesParams): TicketMessage[] {
    const { items: messages } = useListAllMessages(
        {
            ticket_id: ticketId,
            limit: TICKET_THREAD_MESSAGES_PAGE_LIMIT,
        },
        {
            exhaustPages: true,
            query: {
                enabled: !!ticketId,
            },
        },
    )

    return messages ?? []
}
