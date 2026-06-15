import { createContext } from 'react'

export type ExpandedMessagesContextType = {
    expandedMessageIds: number[]
    toggleMessage: (messageId: number | null | undefined) => void
    isMessageExpanded: (messageId: number | null | undefined) => boolean
}

export const ExpandedMessagesContext =
    createContext<ExpandedMessagesContextType | null>(null)
