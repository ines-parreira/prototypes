import { useCallback, useMemo, useState } from 'react'

import type {
    DisplayType,
    TicketMessagesTranslationDisplay,
} from './context/ticketMessageTranslationDisplayContext'
import {
    DisplayedContent,
    FetchingState,
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
    const [allMessageDisplayState, setAllMessageDisplayState] = useState<
        ValueOf<typeof DisplayedContent>
    >(DisplayedContent.Translated)

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

    const setAllTicketMessagesToOriginal = useCallback(() => {
        setTicketMessagesTranslationDisplayMap((prev) => {
            const newMap = { ...prev }
            for (const messageId in newMap) {
                newMap[messageId] = {
                    ...newMap[messageId],
                    display: DisplayedContent.Original,
                }
            }
            return newMap
        })
        setAllMessageDisplayState(DisplayedContent.Original)
    }, [setTicketMessagesTranslationDisplayMap])

    const setAllTicketMessagesToTranslated = useCallback(() => {
        setTicketMessagesTranslationDisplayMap((prev) => {
            const newMap = { ...prev }
            for (const messageId in newMap) {
                newMap[messageId] = {
                    ...newMap[messageId],
                    display: DisplayedContent.Translated,
                }
            }
            return newMap
        })
        setAllMessageDisplayState(DisplayedContent.Translated)
    }, [setTicketMessagesTranslationDisplayMap])

    const value = useMemo(
        () => ({
            getTicketMessageTranslationDisplay,
            setTicketMessageTranslationDisplay,
            setAllTicketMessagesToOriginal,
            setAllTicketMessagesToTranslated,
            allMessageDisplayState,
        }),
        [
            getTicketMessageTranslationDisplay,
            setTicketMessageTranslationDisplay,
            setAllTicketMessagesToOriginal,
            setAllTicketMessagesToTranslated,
            allMessageDisplayState,
        ],
    )

    return (
        <TicketMessagesTranslationDisplayContext.Provider value={value}>
            {children}
        </TicketMessagesTranslationDisplayContext.Provider>
    )
}
