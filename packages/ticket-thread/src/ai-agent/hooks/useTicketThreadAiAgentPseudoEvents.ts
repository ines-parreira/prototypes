import { useMemo } from 'react'

import { useListTicketTags } from '@gorgias/helpdesk-queries'

import { getQueryOptions } from '../../shared/queryOption'
import type { TicketThreadItem } from '../../thread/types'
import type { TicketThreadMessageItem } from '../../ticket-messages/types'
import { isAiAgentPseudoEventMessageItem } from '../predicates/pseudoEvents'
import {
    decorateMessagesWithAiAgentPseudoEvents,
    getAiAgentPseudoEventFromMessage,
} from '../transforms/pseudoEvents'
import type {
    TicketThreadAiAgentPseudoEvent,
    TicketThreadAiAgentPseudoEventTag,
} from '../types'

type UseTicketThreadAiAgentPseudoEventsParams = {
    ticketId: number
    messages: TicketThreadMessageItem[]
    persistedItems: TicketThreadItem[]
    showTicketEvents: boolean
}

export function useTicketThreadAiAgentPseudoEvents({
    ticketId,
    messages,
    persistedItems,
    showTicketEvents,
}: UseTicketThreadAiAgentPseudoEventsParams): TicketThreadMessageItem[] {
    const hasAiAgentMessages = useMemo(
        () => messages.some(isAiAgentPseudoEventMessageItem),
        [messages],
    )

    const { data: ticketTags } = useListTicketTags(ticketId, {
        query: {
            ...getQueryOptions(ticketId),
            enabled: !!ticketId && !showTicketEvents && hasAiAgentMessages,
            select: (response): TicketThreadAiAgentPseudoEventTag[] =>
                (response?.data.data ?? [])
                    .filter(
                        (
                            tag,
                        ): tag is typeof tag & {
                            name: string
                        } => !!tag.name,
                    )
                    .map((tag) => ({
                        id: tag.id,
                        name: tag.name,
                        decoration: tag.decoration ?? null,
                    })),
        },
    })

    return useMemo(() => {
        const pseudoEventsBySourceMessageId = new Map<
            number,
            TicketThreadAiAgentPseudoEvent
        >()
        const availableTicketTags = ticketTags ?? []

        for (const item of messages) {
            if (
                !isAiAgentPseudoEventMessageItem(item) ||
                typeof item.data.id !== 'number'
            ) {
                continue
            }

            pseudoEventsBySourceMessageId.set(
                item.data.id,
                getAiAgentPseudoEventFromMessage(
                    availableTicketTags,
                    item.data,
                ),
            )
        }

        return decorateMessagesWithAiAgentPseudoEvents({
            messages,
            persistedItems,
            pseudoEventsBySourceMessageId,
            showTicketEvents,
        })
    }, [messages, persistedItems, showTicketEvents, ticketTags])
}
