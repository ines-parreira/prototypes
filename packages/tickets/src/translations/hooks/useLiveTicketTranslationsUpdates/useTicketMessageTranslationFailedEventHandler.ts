import { useCallback } from 'react'

import type { DomainEventWithType } from '@gorgias/events'

import { FetchingState } from '../../store/constants'
import { useTicketMessageTranslationDisplay } from '../../store/useTicketMessageTranslationDisplay'

export function useTicketMessageTranslationFailedEventHandler() {
    const {
        setTicketMessageTranslationDisplay,
        getTicketMessageTranslationDisplay,
    } = useTicketMessageTranslationDisplay()

    const handleTicketMessageTranslationFailed = useCallback(
        (
            event: DomainEventWithType<'//helpdesk/ticket-message-translation.failed'>,
        ) => {
            const { ticket_message_id } = event.data
            const displayType =
                getTicketMessageTranslationDisplay(ticket_message_id)

            setTicketMessageTranslationDisplay([
                {
                    messageId: ticket_message_id,
                    ...displayType,
                    fetchingState: FetchingState.Failed,
                },
            ])
        },
        [
            setTicketMessageTranslationDisplay,
            getTicketMessageTranslationDisplay,
        ],
    )
    return {
        handleTicketMessageTranslationFailed,
    }
}
