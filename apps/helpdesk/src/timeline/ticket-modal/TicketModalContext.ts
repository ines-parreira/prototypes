import { createContext, RefObject } from 'react'

export type TicketModalContextType = {
    isInsideTicketModal: boolean
    containerRef: RefObject<HTMLElement> | null
}

export const TicketModalContext = createContext<TicketModalContextType | null>(
    null,
)
