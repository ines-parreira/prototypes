import { useContext } from 'react'

import type { TicketModalContextType } from '../TicketModalContext'
import { TicketModalContext } from '../TicketModalContext'

export const useTicketModalContext = (): TicketModalContextType => {
    const context = useContext(TicketModalContext)

    // Return default values when used outside the provider
    if (!context) {
        return {
            isInsideTicketModal: false,
            containerRef: null,
            isInsideSidePanel: false,
        }
    }

    return context
}
