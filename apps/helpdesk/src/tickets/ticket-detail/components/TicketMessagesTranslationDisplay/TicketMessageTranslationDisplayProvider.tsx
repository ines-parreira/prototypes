import { useCallback, useMemo, useState } from 'react'

import {
    DisplayedContent,
    DisplayType,
    FetchingState,
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
            ticketMessagesTranslationDisplayMap[messageId] ?? {
                display: DisplayedContent.Original,
                fetchingState: FetchingState.Idle,
                hasRegeneratedOnce: false,
            },
        [ticketMessagesTranslationDisplayMap],
    )

    const setTicketMessageTranslationDisplay = useCallback(
        (
            messagesToUpdate: (DisplayType & {
                messageId: number
            })[],
        ) => {
            setTicketMessagesTranslationDisplayMap((prev) => {
                const newMap = { ...prev }
                for (const message of messagesToUpdate) {
                    newMap[message.messageId] = message
                }
                return newMap
            })
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
