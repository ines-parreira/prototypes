import type { ReactNode } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'

import type {
    PlaygroundMessage,
    PlaygroundPromptMessage,
    PlaygroundTextMessage,
} from 'models/aiAgentPlayground/types'
import { usePlaygroundMessages } from 'pages/aiAgent/PlaygroundV2/hooks/usePlaygroundMessages'
import type { PlaygroundCustomer } from 'pages/aiAgent/PlaygroundV2/types'

type MessagesContextValue = {
    messages: PlaygroundMessage[]
    onMessageSend: (
        message: PlaygroundTextMessage | PlaygroundPromptMessage,
        context: { customer: PlaygroundCustomer; subject?: string },
    ) => Promise<void>
    isMessageSending: boolean
    onNewConversation: () => void
    isWaitingResponse: boolean
    draftMessage: string
    draftSubject: string
    setDraftMessage: (message: string) => void
    setDraftSubject: (subject: string) => void
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
    const [draftMessage, setDraftMessage] = useState('')
    const [draftSubject, setDraftSubject] = useState('')

    const messageState = usePlaygroundMessages()

    const value = useMemo(
        () => ({
            ...messageState,
            draftMessage,
            draftSubject,
            setDraftMessage,
            setDraftSubject,
        }),
        [messageState, draftMessage, draftSubject],
    )

    return (
        <MessagesContext.Provider value={value}>
            {children}
        </MessagesContext.Provider>
    )
}
