import { createContext, useContext } from 'react'

type TicketThreadWidthContextValue = {
    containerWidth: number
}

export const TicketThreadWidthContext =
    createContext<TicketThreadWidthContextValue>({
        containerWidth: Infinity,
    })

export function useTicketThreadWidth() {
    return useContext(TicketThreadWidthContext)
}
