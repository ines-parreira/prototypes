import { useContext } from 'react'

import {
    TicketModalContext,
    TicketModalContextType,
} from '../TicketModalContext'

export const useTicketModalContext = (): TicketModalContextType => {
    const context = useContext(TicketModalContext)

    // Return default values when used outside the provider
    if (!context) {
        return {
            isInsideTicketModal: false,
            containerRef: null,
        }
    }

    return context
}
