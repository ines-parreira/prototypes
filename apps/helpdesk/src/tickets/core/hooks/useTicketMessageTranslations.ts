import { useMemo } from 'react'

import type { TicketMessageTranslation } from '@gorgias/helpdesk-types'

import { useTicketTranslations } from './useTicketTranslations'

type TicketTranslationsParams = {
    ticket_id: number
}

type TranslationMap = Record<number, TicketMessageTranslation>

export function useTicketMessageTranslations({
    ticket_id,
}: TicketTranslationsParams) {
    const { data: ticketMessageTranslations } = useTicketTranslations({
        ticket_id,
    })

    const ticketMessagesTranslationMap = useMemo(() => {
        if (!ticketMessageTranslations?.data.data) {
            return {}
        }

        return ticketMessageTranslations.data.data.reduce<TranslationMap>(
            (acc, ticketMessageTranslation) => {
                acc[ticketMessageTranslation.ticket_message_id] =
                    ticketMessageTranslation
                return acc
            },
            {},
        )
    }, [ticketMessageTranslations])

    return {
        ticketMessagesTranslationMap,
    }
}
