import { useMemo } from 'react'

import {
    isActivePendingMessage,
    isFailedPendingMessage,
    isHiddenMessage,
    isSignalMessage,
    isTicketMessage,
} from '#ticket-messages/predicates'
import {
    groupConsecutiveMessages,
    markLastCustomerMessage,
    toTaggedMessage,
} from '#ticket-messages/transforms'
import { TicketThreadPendingState } from '#ticket-messages/types'
import type {
    TicketThreadMessageData,
    TicketThreadMessageItem,
    TicketThreadSingleMessageItem,
} from '#ticket-messages/types'
import { useListTicketMessages } from './useListTicketMessages'

type UseTicketThreadMessagesParams = {
    ticketId: number
    pendingMessages?: unknown[]
}

type UseTicketThreadMessagesResult = {
    messages: TicketThreadMessageItem[]
    activePendingMessages: TicketThreadMessageItem[]
    isLoading: boolean
}

function sortMessagesByDate<TMessage extends TicketThreadMessageData>(
    messages: TMessage[],
): TMessage[] {
    return [...messages].sort((a, b) =>
        a.created_datetime.localeCompare(b.created_datetime),
    )
}

function sortItemsByDate<TItem extends TicketThreadSingleMessageItem>(
    items: TItem[],
): TItem[] {
    return [...items].sort((a, b) => a.datetime.localeCompare(b.datetime))
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
    const { messages, isLoading } = useListTicketMessages({ ticketId })

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
        const persistedMessageItems = sortMessagesByDate(persistedMessages).map(
            (message) => toTaggedMessage(message),
        )
        const failedPendingMessageItems = sortMessagesByDate(
            failedPendingMessages,
        ).map((message) =>
            toTaggedMessage(message, {
                pendingState: TicketThreadPendingState.Failed,
            }),
        )
        const activePendingMessageItems = sortMessagesByDate(
            activePendingMessages,
        ).map((message) =>
            toTaggedMessage(message, {
                pendingState: TicketThreadPendingState.Active,
            }),
        )
        const messagesWithCustomerLastSeenStatus = markLastCustomerMessage([
            ...persistedMessageItems,
            ...failedPendingMessageItems,
            ...activePendingMessageItems,
        ])
        const persistedAndFailedMessages =
            messagesWithCustomerLastSeenStatus.slice(
                0,
                persistedMessageItems.length + failedPendingMessageItems.length,
            )
        const activePendingMessageItemsWithCustomerLastSeenStatus =
            messagesWithCustomerLastSeenStatus.slice(
                persistedMessageItems.length + failedPendingMessageItems.length,
            )
        const groupedMessages = groupConsecutiveMessages(
            sortItemsByDate(persistedAndFailedMessages),
        )
        const groupedActivePendingMessages = groupConsecutiveMessages(
            sortItemsByDate(
                activePendingMessageItemsWithCustomerLastSeenStatus,
            ),
        )

        return {
            messages: groupedMessages,
            activePendingMessages: groupedActivePendingMessages,
            isLoading,
        }
    }, [messages, pendingMessages, isLoading])
}
