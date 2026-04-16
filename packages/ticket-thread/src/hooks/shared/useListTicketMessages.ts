import type { TicketMessage } from '@gorgias/helpdesk-queries'
import { useListMessages } from '@gorgias/helpdesk-queries'

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
                enabled: !!ticketId,
                select: (data): TicketMessage[] => data?.data?.data ?? [],
            },
        },
    )

    return messages ?? []
}
