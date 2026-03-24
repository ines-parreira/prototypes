import { useMemo } from 'react'

import { useListTicketMessages } from '../shared/useListTicketMessages'
import {
    isActivePendingMessage,
    isFailedPendingMessage,
    isHiddenMessage,
    isSignalMessage,
    isTicketMessage,
} from './predicates'
import { groupConsecutiveMessages, toTaggedMessage } from './transforms'
import type { TicketThreadMessageData, TicketThreadMessageItem } from './types'

type UseTicketThreadMessagesParams = {
    ticketId: number
    pendingMessages?: unknown[]
}

type UseTicketThreadMessagesResult = {
    messages: TicketThreadMessageItem[]
    activePendingMessages: TicketThreadMessageItem[]
}

function sortMessagesByDate<TMessage extends TicketThreadMessageData>(
    messages: TMessage[],
): TMessage[] {
    return [...messages].sort((a, b) =>
        a.created_datetime.localeCompare(b.created_datetime),
    )
}

export function useTicketThreadMessages({
    ticketId,
    pendingMessages,
}: UseTicketThreadMessagesParams): UseTicketThreadMessagesResult {
    const messages = useListTicketMessages({ ticketId })

    return useMemo(() => {
        const persistedMessages = (messages ?? [])
            .filter(isTicketMessage)
            .filter(
                (message) =>
                    !isHiddenMessage(message) && !isSignalMessage(message),
            )
        const normalizedPendingMessages = (pendingMessages ?? []).filter(
            isTicketMessage,
        )
        const failedPendingMessages = normalizedPendingMessages.filter(
            isFailedPendingMessage,
        )
        const activePendingMessages = normalizedPendingMessages.filter(
            isActivePendingMessage,
        )

        const groupedMessages = groupConsecutiveMessages(
            sortMessagesByDate([
                ...persistedMessages,
                ...failedPendingMessages,
            ]).map(toTaggedMessage),
        )
        const groupedActivePendingMessages = groupConsecutiveMessages(
            sortMessagesByDate(activePendingMessages).map(toTaggedMessage),
        )

        return {
            messages: groupedMessages,
            activePendingMessages: groupedActivePendingMessages,
        }
    }, [messages, pendingMessages])
}
