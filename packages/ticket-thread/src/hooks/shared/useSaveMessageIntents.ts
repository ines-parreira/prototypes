import { useMutation } from '@tanstack/react-query'

import { request } from '@gorgias/helpdesk-client'
import type { TicketMessageIntent } from '@gorgias/helpdesk-types'

type SaveMessageIntentsParams = {
    ticketId: number
    messageId: number
    activeIntents: string[]
}

export function useSaveMessageIntents() {
    return useMutation({
        mutationFn: ({
            ticketId,
            messageId,
            activeIntents,
        }: SaveMessageIntentsParams) =>
            request<{ intents: TicketMessageIntent[] }>({
                method: 'POST',
                url: `/api/tickets/${ticketId}/messages/${messageId}/intents/`,
                data: { active_intents: activeIntents },
            }),
    })
}
