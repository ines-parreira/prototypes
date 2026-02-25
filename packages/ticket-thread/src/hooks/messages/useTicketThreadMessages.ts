import { useMemo } from 'react'

import type { TicketMessage } from '@gorgias/helpdesk-queries'

import { useListTicketMessages } from '../shared/useListTicketMessages'
import {
    isActivePendingMessage,
    isFailedPendingMessage,
    isHiddenMessage,
    isSignalMessage,
    isTicketMessage,
} from './predicates'
import { mergeConsecutiveMessages, toTaggedMessage } from './transforms'
import type { TicketThreadMessageItem } from './types'

type UseTicketThreadMessagesParams = {
    ticketId: number
    pendingMessages?: unknown[]
}

type UseTicketThreadMessagesResult = {
    messages: TicketThreadMessageItem[]
    activePendingMessages: TicketThreadMessageItem[]
}

function sortMessagesByDate(messages: TicketMessage[]): TicketMessage[] {
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
        const persistedMessages = (messages ?? []).filter(
            (message) =>
                isTicketMessage(message) &&
                !isHiddenMessage(message) &&
                !isSignalMessage(message),
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

        const mergedMessages = mergeConsecutiveMessages(
            sortMessagesByDate([
                ...persistedMessages,
                ...failedPendingMessages,
            ]).map(toTaggedMessage),
        )
        const mergedActivePendingMessages = mergeConsecutiveMessages(
            sortMessagesByDate(activePendingMessages).map(toTaggedMessage),
        )

        return {
            messages: mergedMessages,
            activePendingMessages: mergedActivePendingMessages,
        }
    }, [messages, pendingMessages])
}
