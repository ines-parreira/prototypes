import { createContext } from 'react'

export const DisplayedContent = {
    Original: 'original',
    Translated: 'translated',
} as const

export const FetchingState = {
    Idle: 'idle',
    Loading: 'loading',
    Completed: 'completed',
    Failed: 'failed',
}

export type DisplayType = {
    display: ValueOf<typeof DisplayedContent>
    fetchingState: ValueOf<typeof FetchingState>
}

export type TicketMessagesTranslationDisplay = Record<number, DisplayType>

export const TicketMessagesTranslationDisplayMap: TicketMessagesTranslationDisplay =
    {}

export type TicketMessagesTranslationDisplayContextType = {
    getTicketMessageTranslationDisplay: (messageId: number) => DisplayType
    setTicketMessageTranslationDisplay: (
        messagesToUpdate: (DisplayType & {
            messageId: number
        })[],
    ) => void
}

export const TicketMessagesTranslationDisplayContext =
    createContext<TicketMessagesTranslationDisplayContextType>({
        getTicketMessageTranslationDisplay: () => ({
            display: DisplayedContent.Original,
            fetchingState: FetchingState.Idle,
        }),
        setTicketMessageTranslationDisplay: () => {},
    })
