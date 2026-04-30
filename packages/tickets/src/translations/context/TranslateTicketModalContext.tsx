import { createContext } from 'react'

export type TranslateTicketModalContextValue = {
    openTranslateTicketModal: () => void
}

export const TranslateTicketModalContext =
    createContext<TranslateTicketModalContextValue | null>(null)
