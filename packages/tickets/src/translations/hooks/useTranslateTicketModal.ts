import { useContext } from 'react'

import { TranslateTicketModalContext } from '../context/TranslateTicketModalContext'

export function useTranslateTicketModal() {
    const context = useContext(TranslateTicketModalContext)

    if (!context) {
        throw new Error(
            'useTranslateTicketModal must be used within TranslateTicketModalProvider',
        )
    }

    return context
}
