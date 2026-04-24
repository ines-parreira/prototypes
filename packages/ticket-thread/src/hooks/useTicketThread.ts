import { useMemo } from 'react'

import { useGetTicket } from '@gorgias/helpdesk-queries'

import { useTicketThreadAiAgentPseudoEvents } from './ai-agent-pseudo-events/useTicketThreadAiAgentPseudoEvents'
import { useContactReasonPrediction } from './contact-reason-prediction/useContactReasonPrediction'
import { groupConsecutiveEvents } from './events/transforms'
import { useTicketThreadEvents } from './events/useTicketThreadEvents'
import { extractHttpActionsFromMessages } from './messages/httpActions'
import { useTicketThreadMessages } from './messages/useTicketThreadMessages'
import { useRuleSuggestion } from './rules-suggestions/useRuleSuggestion'
import { useTicketThreadSatisfactionSurveys } from './satisfaction-survey/useTicketThreadSatisfactionSurveys'
import { getQueryOptions } from './shared/queryOption'
import { useTicketThreadShoppingAssistantEvents } from './shopping-assistant-events/useTicketThreadShoppingAssistantEvents'
import { sortTicketThreadItems } from './sortTicketThread'
import type { TicketThreadItem } from './types'
import { TicketThreadItemTag } from './types'
import { useTicketThreadVoiceCalls } from './voice-calls/useTicketThreadVoiceCalls'

type UseTicketThreadParams = {
    ticketId: number
    showTicketEvents?: boolean
    pendingMessages?: unknown[]
}

export function useTicketThread({
    ticketId,
    showTicketEvents = true,
    pendingMessages,
}: UseTicketThreadParams) {
    const { data: ticket } = useGetTicket(ticketId, undefined, {
        query: {
            ...getQueryOptions(ticketId),
            select: (data) => data?.data,
        },
    })

    const { messages, activePendingMessages } = useTicketThreadMessages({
        ticketId,
        pendingMessages,
    })
    const { events } = useTicketThreadEvents({ ticketId })
    const { items: shoppingAssistantItems } =
        useTicketThreadShoppingAssistantEvents({
            ticketId,
        })
    const voiceCalls = useTicketThreadVoiceCalls({ ticketId })
    const satisfactionSurveys = useTicketThreadSatisfactionSurveys({
        ticketId,
        ticket,
    })

    const { insertRuleSuggestion } = useRuleSuggestion({ ticketId })
    const { insertContactReasonPrediction } = useContactReasonPrediction({
        ticketId,
    })

    const persistedItems = useMemo(
        () =>
            sortTicketThreadItems([
                ...messages,
                ...events,
                ...shoppingAssistantItems,
                ...voiceCalls,
                ...satisfactionSurveys,
            ]),
        [
            messages,
            events,
            shoppingAssistantItems,
            voiceCalls,
            satisfactionSurveys,
        ],
    )

    const messagesWithAiAgentPseudoEvents = useTicketThreadAiAgentPseudoEvents({
        ticketId,
        messages,
        persistedItems,
        showTicketEvents,
    })

    const httpActionItems = useMemo(
        () => extractHttpActionsFromMessages(messages),
        [messages],
    )

    const httpActionKeys = useMemo(
        () =>
            new Set(
                httpActionItems.map(
                    (item) => `${item.data.user_id}-${item.datetime}`,
                ),
            ),
        [httpActionItems],
    )

    const ticketThreadItems = useMemo(() => {
        const deduplicatedEvents = events.filter((event) => {
            if (event._tag !== TicketThreadItemTag.Events.ActionExecutedEvent) {
                return true
            }
            if (event.data.data.action_name !== 'customHttpAction') {
                return true
            }
            return !httpActionKeys.has(
                `${event.data.user_id}-${event.datetime}`,
            )
        })

        let items: TicketThreadItem[] = sortTicketThreadItems([
            ...messagesWithAiAgentPseudoEvents,
            ...deduplicatedEvents,
            ...httpActionItems,
            ...shoppingAssistantItems,
            ...voiceCalls,
            ...satisfactionSurveys,
        ])
        items = [...items, ...activePendingMessages]

        items = insertRuleSuggestion(items)
        items = insertContactReasonPrediction(items)

        return groupConsecutiveEvents(items)
    }, [
        messagesWithAiAgentPseudoEvents,
        activePendingMessages,
        events,
        httpActionItems,
        httpActionKeys,
        shoppingAssistantItems,
        voiceCalls,
        satisfactionSurveys,
        insertRuleSuggestion,
        insertContactReasonPrediction,
    ])

    return { ticketThreadItems }
}
