import { useMemo } from 'react'

import { useTicketMessageTranslations } from './useTicketMessageTranslations'

type UseTicketMessageTranslationParams = {
    ticketId?: number
    messageId?: number
}

export function useTicketMessageTranslation({
    ticketId,
    messageId,
}: UseTicketMessageTranslationParams) {
    const { ticketMessagesTranslationMap } = useTicketMessageTranslations({
        ticket_id: ticketId ?? 0,
    })

    return useMemo(() => {
        if (!messageId) return
        return ticketMessagesTranslationMap[messageId]
    }, [messageId, ticketMessagesTranslationMap])
}
