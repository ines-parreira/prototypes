import { createContext, ReactNode, useContext } from 'react'

import {
    PlaygroundMessage,
    PlaygroundPromptMessage,
    PlaygroundTextMessage,
} from 'models/aiAgentPlayground/types'
import { ConfigurationProvider } from 'pages/aiAgent/PlaygroundV2/contexts/ConfigurationContext'
import { CoreProvider } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'
import { EventsProvider } from 'pages/aiAgent/PlaygroundV2/contexts/EventsContext'

import { usePlaygroundMessages } from '../hooks/usePlaygroundMessages'
import { PlaygroundCustomer } from '../types'

type PlaygroundMessagesState = {
    messages: PlaygroundMessage[]
    onMessageSend: (
        message: PlaygroundTextMessage | PlaygroundPromptMessage,
        context: { customer: PlaygroundCustomer; subject?: string },
    ) => Promise<void>
    isMessageSending: boolean
    onNewConversation: () => void
    isWaitingResponse: boolean
}

type PlaygroundContextValue = PlaygroundMessagesState

const PlaygroundContext = createContext<PlaygroundContextValue | undefined>(
    undefined,
)

export const usePlaygroundContext = () => {
    const context = useContext(PlaygroundContext)
    if (!context) {
        throw new Error(
            'usePlaygroundContext must be used within PlaygroundProvider',
        )
    }
    return context
}

type PlaygroundProviderProps = {
    children: ReactNode
    arePlaygroundActionsAllowed?: boolean
}

export const InnerPlaygroundProvider = ({
    children,
}: {
    children: ReactNode
}) => {
    const messagesState = usePlaygroundMessages()

    const contextValue: PlaygroundContextValue = {
        ...messagesState,
    }

    return (
        <PlaygroundContext.Provider value={contextValue}>
            {children}
        </PlaygroundContext.Provider>
    )
}

export const PlaygroundProvider = (props: PlaygroundProviderProps) => {
    return (
        <EventsProvider>
            <ConfigurationProvider>
                <CoreProvider>
                    <InnerPlaygroundProvider>
                        {props.children}
                    </InnerPlaygroundProvider>
                </CoreProvider>
            </ConfigurationProvider>
        </EventsProvider>
    )
}
