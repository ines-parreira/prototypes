import { useCallback, useMemo } from 'react'

import { TicketVia, useGetTicket } from '@gorgias/helpdesk-queries'

import { useTicketThreadLegacyBridge } from '../../utils/LegacyBridge'
import { getQueryOptions } from '../shared/queryOption'
import { useListTicketMessages } from '../shared/useListTicketMessages'
import type { TicketThreadItem } from '../types'
import { TicketThreadItemTag } from '../types'
import {
    isMessageMetaWithRuleSuggestionSlug,
    isRuleSuggestion,
} from './predicates'
import { shouldRenderRuleSuggestion } from './transforms'

const SINGLE_MESSAGE_TAGS = new Set<string>(
    Object.values(TicketThreadItemTag.Messages).filter(
        (tag) => tag !== TicketThreadItemTag.Messages.MergedMessages,
    ),
)

function isSingleMessageItem(
    item: TicketThreadItem,
): item is Extract<TicketThreadItem, { data: { from_agent: boolean } }> {
    return SINGLE_MESSAGE_TAGS.has(item._tag)
}

function isMergedMessagesItem(
    item: TicketThreadItem,
): item is Extract<
    TicketThreadItem,
    { _tag: typeof TicketThreadItemTag.Messages.MergedMessages }
> {
    return item._tag === TicketThreadItemTag.Messages.MergedMessages
}

function getMessageMetadata(item: TicketThreadItem): {
    fromAgent: boolean
    via: string
} | null {
    if (isSingleMessageItem(item)) {
        return {
            fromAgent: item.data.from_agent,
            via: item.data.via,
        }
    }

    if (isMergedMessagesItem(item)) {
        const firstMessage = item.data.at(0)
        if (!firstMessage) {
            return null
        }
        return {
            fromAgent: firstMessage.data.from_agent,
            via: firstMessage.data.via,
        }
    }

    return null
}

function getSuggestionPosition(items: TicketThreadItem[]): number {
    const index = items.findIndex((item) => {
        const metadata = getMessageMetadata(item)
        return (
            metadata !== null &&
            metadata.fromAgent === true &&
            metadata.via !== TicketVia.Rule
        )
    })
    return index !== -1 ? index : items.length
}

type UseRuleSuggestionParams = {
    ticketId: number
}

export function useRuleSuggestion({ ticketId }: UseRuleSuggestionParams) {
    const {
        currentTicketRuleSuggestionData: { shouldDisplayDemoSuggestion },
    } = useTicketThreadLegacyBridge()
    const messages = useListTicketMessages({ ticketId })
    const { data: ticket } = useGetTicket(ticketId, undefined, {
        query: {
            ...getQueryOptions(ticketId),
            select: (data) => data?.data,
        },
    })
    const ruleSuggestionMeta = useMemo(
        () => (isRuleSuggestion(ticket?.meta) ? ticket.meta : null),
        [ticket?.meta],
    )

    const shouldInsertRuleSuggestion = useMemo(() => {
        if (
            !shouldRenderRuleSuggestion({
                ruleSuggestionMeta,
                shouldDisplayDemoSuggestion,
            })
        ) {
            return false
        }

        if (!messages) return false

        return !messages.some((message) =>
            isMessageMetaWithRuleSuggestionSlug(message.meta),
        )
    }, [messages, ruleSuggestionMeta, shouldDisplayDemoSuggestion])

    const insertRuleSuggestion = useCallback(
        (items: TicketThreadItem[]): TicketThreadItem[] => {
            if (!shouldInsertRuleSuggestion) return items
            if (!ruleSuggestionMeta) return items
            const index = getSuggestionPosition(items)
            return [
                ...items.slice(0, index),
                {
                    _tag: TicketThreadItemTag.RuleSuggestion,
                    data: ruleSuggestionMeta,
                },
                ...items.slice(index),
            ]
        },
        [shouldInsertRuleSuggestion, ruleSuggestionMeta],
    )

    return { insertRuleSuggestion }
}
