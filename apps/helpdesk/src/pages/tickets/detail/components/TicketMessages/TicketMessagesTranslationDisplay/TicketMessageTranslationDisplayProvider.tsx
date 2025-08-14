import { useCallback, useMemo, useState } from 'react'

import {
    DisplayedContent,
    DisplayedContentType,
    TicketMessagesTranslationDisplay,
    TicketMessagesTranslationDisplayContext,
    TicketMessagesTranslationDisplayMap,
} from './context/ticketMessageTranslationDisplayContext'

export function TicketMessageTranslationDisplayProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const [
        ticketMessagesTranslationDisplayMap,
        setTicketMessagesTranslationDisplayMap,
    ] = useState<TicketMessagesTranslationDisplay>(
        TicketMessagesTranslationDisplayMap,
    )

    const getTicketMessageTranslationDisplay = useCallback(
        (messageId: number) =>
            ticketMessagesTranslationDisplayMap[messageId] ??
            DisplayedContent.Translated,
        [ticketMessagesTranslationDisplayMap],
    )

    const setTicketMessageTranslationDisplay = useCallback(
        (messageId: number, displayedContent: DisplayedContentType) => {
            setTicketMessagesTranslationDisplayMap((prev) => ({
                ...prev,
                [messageId]: displayedContent,
            }))
        },
        [setTicketMessagesTranslationDisplayMap],
    )

    const value = useMemo(
        () => ({
            getTicketMessageTranslationDisplay,
            setTicketMessageTranslationDisplay,
        }),
        [
            getTicketMessageTranslationDisplay,
            setTicketMessageTranslationDisplay,
        ],
    )

    return (
        <TicketMessagesTranslationDisplayContext.Provider value={value}>
            {children}
        </TicketMessagesTranslationDisplayContext.Provider>
    )
}
