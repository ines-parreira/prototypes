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

function stableSerialize(value: unknown): string {
    if (Array.isArray(value)) {
        return `[${value.map(stableSerialize).join(',')}]`
    }

    if (value && typeof value === 'object') {
        const entries = Object.entries(value as Record<string, unknown>).sort(
            ([keyA], [keyB]) => keyA.localeCompare(keyB),
        )

        return `{${entries
            .map(
                ([key, nestedValue]) =>
                    `${key}:${stableSerialize(nestedValue)}`,
            )
            .join(',')}}`
    }

    return JSON.stringify(value)
}

function matchesPersistedMessage(
    pendingMessage: TicketThreadMessageData,
    persistedMessage: TicketThreadMessageData,
): boolean {
    return (
        pendingMessage.body_html === persistedMessage.body_html &&
        pendingMessage.body_text === persistedMessage.body_text &&
        pendingMessage.channel === persistedMessage.channel &&
        pendingMessage.from_agent === persistedMessage.from_agent &&
        stableSerialize(pendingMessage.source?.from) ===
            stableSerialize(persistedMessage.source?.from) &&
        stableSerialize(pendingMessage.source?.to) ===
            stableSerialize(persistedMessage.source?.to) &&
        stableSerialize(pendingMessage.source?.extra) ===
            stableSerialize(persistedMessage.source?.extra)
    )
}

export function useTicketThreadMessages({
    ticketId,
    pendingMessages,
}: UseTicketThreadMessagesParams): UseTicketThreadMessagesResult {
    const messages = useListTicketMessages({ ticketId })

    return useMemo(() => {
        const persistedMessages = messages
            .filter(isTicketMessage)
            .filter(
                (message) =>
                    !isHiddenMessage(message) && !isSignalMessage(message),
            )
        const normalizedPendingMessages = (pendingMessages ?? []).filter(
            isTicketMessage,
        )
        const deduplicatedPendingMessages = normalizedPendingMessages.filter(
            (pendingMessage) =>
                !persistedMessages.some((persistedMessage) =>
                    matchesPersistedMessage(pendingMessage, persistedMessage),
                ),
        )
        const failedPendingMessages = deduplicatedPendingMessages.filter(
            isFailedPendingMessage,
        )
        const activePendingMessages = deduplicatedPendingMessages.filter(
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
