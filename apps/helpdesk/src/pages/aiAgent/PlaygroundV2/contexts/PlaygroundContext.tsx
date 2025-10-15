import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'

import { StoreConfiguration } from 'models/aiAgent/types'
import {
    PlaygroundMessage,
    PlaygroundPromptMessage,
    PlaygroundTextMessage,
} from 'models/aiAgentPlayground/types'

import { usePlaygroundChannel } from '../hooks/usePlaygroundChannel'
import { usePlaygroundMessages } from '../hooks/usePlaygroundMessages'
import {
    EventCallback,
    EventHandlers,
    PlaygroundChannelAvailability,
    PlaygroundChannels,
    PlaygroundCustomer,
    PlaygroundEvent,
    PlaygroundEventEmitter,
} from '../types'

type PlaygroundUIState = {
    isInitialMessage: boolean
    setIsInitialMessage: (value: boolean) => void
}

type PlaygroundChannelState = {
    channel: PlaygroundChannels
    channelAvailability: PlaygroundChannelAvailability
    onChannelChange: (channel: PlaygroundChannels) => void
    onChannelAvailabilityChange: (
        availability: PlaygroundChannelAvailability,
    ) => void
}

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

type PlaygroundContextValue = {
    storeConfiguration?: StoreConfiguration
    snippetHelpCenterId?: number
    httpIntegrationId: number
    baseUrl?: string
    gorgiasDomain: string
    accountId: number
    chatIntegrationId?: number
    events: PlaygroundEventEmitter
    uiState: PlaygroundUIState
    channelState: PlaygroundChannelState
    messagesState: PlaygroundMessagesState
}

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

export const usePlaygroundEvent = (
    event: PlaygroundEvent,
    callback: EventCallback,
) => {
    const { events } = usePlaygroundContext()

    useEffect(() => {
        return events.on(event, callback)
    }, [events, event, callback])
}

type PlaygroundProviderProps = {
    children: ReactNode
    value: Omit<
        PlaygroundContextValue,
        'events' | 'uiState' | 'channelState' | 'messagesState'
    >
    arePlaygroundActionsAllowed?: boolean
}

export const PlaygroundProvider = ({
    children,
    value,
    arePlaygroundActionsAllowed,
}: PlaygroundProviderProps) => {
    const eventHandlers = useMemo<EventHandlers>(
        () => ({
            [PlaygroundEvent.RESET_CONVERSATION]: [],
        }),
        [],
    )

    const [isInitialMessage, setIsInitialMessage] = useState(true)

    const channelState = usePlaygroundChannel()

    const on = useCallback(
        (event: PlaygroundEvent, callback: EventCallback) => {
            eventHandlers[event].push(callback)

            return () => {
                eventHandlers[event] = eventHandlers[event].filter(
                    (cb) => cb !== callback,
                )
            }
        },
        [eventHandlers],
    )

    const emit = useCallback(
        (event: PlaygroundEvent) => {
            eventHandlers[event].forEach((callback) => callback())

            // Reset isInitialMessage when reset event is emitted
            if (event === PlaygroundEvent.RESET_CONVERSATION) {
                setIsInitialMessage(true)
            }
        },
        [eventHandlers],
    )

    const events = useMemo(() => ({ on, emit }), [on, emit])

    const messagesState = usePlaygroundMessages({
        storeData: value.storeConfiguration,
        gorgiasDomain: value.gorgiasDomain,
        accountId: value.accountId,
        httpIntegrationId: value.httpIntegrationId,
        channel: channelState.channel,
        channelIntegrationId:
            channelState.channel === 'chat'
                ? value.chatIntegrationId
                : undefined,
        channelAvailability: channelState.channelAvailability,
        baseUrl: value.baseUrl,
        arePlaygroundActionsAllowed,
        events,
    })

    const contextValue: PlaygroundContextValue = {
        ...value,
        events,
        uiState: { isInitialMessage, setIsInitialMessage },
        channelState,
        messagesState,
    }

    return (
        <PlaygroundContext.Provider value={contextValue}>
            {children}
        </PlaygroundContext.Provider>
    )
}
