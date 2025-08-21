import { useCallback } from 'react'

import { useRequestTicketMessageTranslation } from '@gorgias/helpdesk-queries'

import { FetchingState } from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/ticketMessageTranslationDisplayContext'
import { useTicketMessageTranslationDisplay } from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/useTicketMessageTranslationDisplay'

import { useCurrentUserPreferredLanguage } from './useCurrentUserPreferredLanguage'

export function useRegenerateTicketMessageTranslations() {
    const { primary } = useCurrentUserPreferredLanguage()
    const {
        setTicketMessageTranslationDisplay,
        getTicketMessageTranslationDisplay,
    } = useTicketMessageTranslationDisplay()

    const { mutateAsync: generateTicketMessageTranslations } =
        useRequestTicketMessageTranslation()

    const regenerateTicketMessageTranslations = useCallback(
        async (ticket_message_id: number) => {
            if (!primary) {
                return
            }

            const current =
                getTicketMessageTranslationDisplay(ticket_message_id)

            try {
                await generateTicketMessageTranslations({
                    data: {
                        language: primary,
                        ticket_message_id,
                    },
                })

                setTicketMessageTranslationDisplay([
                    {
                        messageId: ticket_message_id,
                        display: current.display,
                        fetchingState: FetchingState.Loading,
                        hasRegeneratedOnce: true,
                    },
                ])
            } catch {
                setTicketMessageTranslationDisplay([
                    {
                        messageId: ticket_message_id,
                        display: current.display,
                        fetchingState: FetchingState.Failed,
                        hasRegeneratedOnce: true,
                    },
                ])
            }
        },
        [
            primary,
            generateTicketMessageTranslations,
            setTicketMessageTranslationDisplay,
            getTicketMessageTranslationDisplay,
        ],
    )

    return {
        regenerateTicketMessageTranslations,
    }
}
