import { useContext } from 'react'

import { TicketMessagesTranslationDisplayContext } from './ticketMessageTranslationDisplayContext'

export function useTicketMessageTranslationDisplay() {
    const context = useContext(TicketMessagesTranslationDisplayContext)
    if (context === undefined) {
        throw new Error(
            'useTicketMessageTranslation must be used within a TicketMessagesTranslationDisplayProvider',
        )
    }
    return context
}
