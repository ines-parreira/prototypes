import { createContext } from 'react'

export type MessageExpansionContextType = {
    expandedMessages: number[]
    toggleMessage: (messageId: number | undefined) => void
}

export const MessageExpansionContext =
    createContext<MessageExpansionContextType>({
        expandedMessages: [],
        toggleMessage: () => {},
    })
