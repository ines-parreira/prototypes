import { createContext } from 'react'

export const DisplayedContent = {
    Original: 'original',
    Translated: 'translated',
} as const

export type DisplayedContentType = ValueOf<typeof DisplayedContent>

export type TicketMessagesTranslationDisplay = Record<
    number,
    DisplayedContentType
>

export const TicketMessagesTranslationDisplayMap: TicketMessagesTranslationDisplay =
    {}

export type TicketMessagesTranslationDisplayContextType = {
    getTicketMessageTranslationDisplay: (
        messageId: number,
    ) => DisplayedContentType
    setTicketMessageTranslationDisplay: (
        messageId: number,
        displayedContent: DisplayedContentType,
    ) => void
}

export const TicketMessagesTranslationDisplayContext =
    createContext<TicketMessagesTranslationDisplayContextType>({
        getTicketMessageTranslationDisplay: () => 'original',
        setTicketMessageTranslationDisplay: () => {},
    })
