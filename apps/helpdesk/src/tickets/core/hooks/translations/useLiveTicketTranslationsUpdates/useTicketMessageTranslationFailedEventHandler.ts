import { useCallback } from 'react'

import {
    DisplayedContent,
    FetchingState,
} from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/ticketMessageTranslationDisplayContext'
import { useTicketMessageTranslationDisplay } from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/useTicketMessageTranslationDisplay'

import type { ExtractEvent } from '../types'

export function useTicketMessageTranslationFailedEventHandler() {
    const { setTicketMessageTranslationDisplay } =
        useTicketMessageTranslationDisplay()

    const handleTicketMessageTranslationFailed = useCallback(
        (
            event: ExtractEvent<'//helpdesk/ticket-message-translation.failed/1.0.0'>,
        ) => {
            const { ticket_message_id } = event.data
            setTicketMessageTranslationDisplay([
                {
                    messageId: ticket_message_id,
                    display: DisplayedContent.Original,
                    fetchingState: FetchingState.Failed,
                },
            ])
        },
        [setTicketMessageTranslationDisplay],
    )
    return {
        handleTicketMessageTranslationFailed,
    }
}
