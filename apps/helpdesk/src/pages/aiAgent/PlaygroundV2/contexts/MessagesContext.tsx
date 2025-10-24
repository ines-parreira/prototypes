import { createContext, ReactNode, useContext } from 'react'

import {
    PlaygroundMessage,
    PlaygroundPromptMessage,
    PlaygroundTextMessage,
} from 'models/aiAgentPlayground/types'
import { usePlaygroundMessages } from 'pages/aiAgent/PlaygroundV2/hooks/usePlaygroundMessages'

import { PlaygroundCustomer } from '../types'

type MessagesContextValue = {
    messages: PlaygroundMessage[]
    onMessageSend: (
        message: PlaygroundTextMessage | PlaygroundPromptMessage,
        context: { customer: PlaygroundCustomer; subject?: string },
    ) => Promise<void>
    isMessageSending: boolean
    onNewConversation: () => void
    isWaitingResponse: boolean
}

const MessagesContext = createContext<MessagesContextValue | undefined>(
    undefined,
)

export const useMessagesContext = () => {
    const context = useContext(MessagesContext)
    if (!context) {
        throw new Error(
            'useMessagesContext must be used within a MessagesProvider',
        )
    }
    return context
}

type MessagesProviderProps = {
    children: ReactNode
}

export const MessagesProvider = ({ children }: MessagesProviderProps) => {
    const messageState = usePlaygroundMessages()

    return (
        <MessagesContext.Provider value={messageState}>
            {children}
        </MessagesContext.Provider>
    )
}
