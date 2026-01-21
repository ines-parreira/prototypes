import type { RefObject } from 'react'
import { createContext } from 'react'

export type TicketModalContextType = {
    isInsideTicketModal: boolean
    containerRef: RefObject<HTMLElement> | null
    isInsideSidePanel: boolean
}

export const TicketModalContext = createContext<TicketModalContextType | null>(
    null,
)
