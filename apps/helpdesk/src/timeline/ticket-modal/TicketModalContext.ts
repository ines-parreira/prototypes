import type { RefObject } from 'react'
import { createContext } from 'react'

export type TicketModalContextType = {
    isInsideTicketModal: boolean
    containerRef: RefObject<HTMLElement> | null
}

export const TicketModalContext = createContext<TicketModalContextType | null>(
    null,
)
