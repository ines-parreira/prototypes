import type { TicketMessage } from '@gorgias/helpdesk-queries'
import { useListAllMessages } from '@gorgias/helpdesk-queries'

type UseListTicketMessagesParams = {
    ticketId: number
}

export function useListTicketMessages({
    ticketId,
}: UseListTicketMessagesParams): TicketMessage[] {
    const { items: messages } = useListAllMessages(
        {
            ticket_id: ticketId,
            limit: 100,
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
