import { useMemo } from 'react'

import type { TicketThreadItemType } from '@repo/ticket-thread'
import { TicketThreadItemTag } from '@repo/ticket-thread'

const INTERNAL_MESSAGE_TAGS: ReadonlySet<string> = new Set([
    TicketThreadItemTag.Messages.InternalNote,
    TicketThreadItemTag.Messages.AiAgentInternalNote,
])

const MESSAGE_TAGS: Set<string> = new Set(
    Object.values(TicketThreadItemTag.Messages),
)

type MessageItemBase = {
    _tag: string
    datetime: string
}

function isMessageItem(
    item: TicketThreadItemType,
): item is TicketThreadItemType & MessageItemBase {
    return MESSAGE_TAGS.has(item._tag)
}

type TicketThreadMessageStats = {
    messageCount: number
    messagesAfterHandover: number
    hasHandoverMessage: boolean
    hasInternalMessages: boolean
    hasExternalMessages: boolean
    latestMessageDatetime: string | null
}

export function useTicketThreadMessageStats(
    ticketThreadItems: TicketThreadItemType[],
): TicketThreadMessageStats {
    return useMemo(() => {
        let total = 0
        let afterHandover = 0
        let hasHandover = false
        let hasInternal = false
        let hasExternal = false
        let latest: string | null = null

        for (const item of ticketThreadItems) {
            if (
                item._tag ===
                TicketThreadItemTag.Messages.AiAgentHandoverMessage
            ) {
                hasHandover = true
                total++
                if (!latest || item.datetime > latest) latest = item.datetime
                continue
            }

            if (item._tag === TicketThreadItemTag.Messages.GroupedMessages) {
                for (const msg of item.data) {
                    total++
                    if (hasHandover) afterHandover++
                    if (INTERNAL_MESSAGE_TAGS.has(msg._tag)) {
                        hasInternal = true
                    } else {
                        hasExternal = true
                    }
                    if (!latest || msg.datetime > latest) latest = msg.datetime
                }
                continue
            }

            if (isMessageItem(item)) {
                total++
                if (hasHandover) afterHandover++
                if (INTERNAL_MESSAGE_TAGS.has(item._tag)) {
                    hasInternal = true
                } else {
                    hasExternal = true
                }
                if (!latest || item.datetime > latest) latest = item.datetime
            }
        }

        return {
            messageCount: total,
            messagesAfterHandover: afterHandover,
            hasHandoverMessage: hasHandover,
            hasInternalMessages: hasInternal,
            hasExternalMessages: hasExternal,
            latestMessageDatetime: latest,
        }
    }, [ticketThreadItems])
}
