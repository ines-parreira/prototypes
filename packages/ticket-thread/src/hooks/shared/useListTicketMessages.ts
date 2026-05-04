import type { TicketMessage } from '@gorgias/helpdesk-queries'
import { useListAllMessages } from '@gorgias/helpdesk-queries'

type UseListTicketMessagesParams = {
    ticketId: number
}

export const TICKET_THREAD_MESSAGES_PAGE_LIMIT = 100

type UseListTicketMessagesResult = {
    messages: TicketMessage[]
    isLoading: boolean
}

export function useListTicketMessages({
    ticketId,
}: UseListTicketMessagesParams): UseListTicketMessagesResult {
    const { items: messages, isLoading } = useListAllMessages(
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

    return { messages: messages ?? [], isLoading }
}
