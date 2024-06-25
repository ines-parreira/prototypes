import {createContext} from 'react'

export type TicketIds = {
    prev: number | undefined
    next: number | undefined
}

export type ContextType = {
    isEnabled: boolean
    setIsEnabled: (value: boolean) => void
    previousTicketId: TicketIds['prev']
    nextTicketId: TicketIds['next']
    setPrevNextTicketIds: (ticketIds: TicketIds) => void
    shouldRedirectToSplitView: boolean
    setShouldRedirectToSplitView: (value: boolean) => void
} | null

export default createContext<ContextType>(null)
