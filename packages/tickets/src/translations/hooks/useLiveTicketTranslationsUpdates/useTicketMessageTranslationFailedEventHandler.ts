import { useCallback } from 'react'

import { FetchingState } from '../../store/constants'
import { useTicketMessageTranslationDisplay } from '../../store/useTicketMessageTranslationDisplay'
import type { ExtractEvent } from '../types'

export function useTicketMessageTranslationFailedEventHandler() {
    const {
        setTicketMessageTranslationDisplay,
        getTicketMessageTranslationDisplay,
    } = useTicketMessageTranslationDisplay()

    const handleTicketMessageTranslationFailed = useCallback(
        (
            event: ExtractEvent<'//helpdesk/ticket-message-translation.failed/1.0.0'>,
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
