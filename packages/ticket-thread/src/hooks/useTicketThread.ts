import { useMemo } from 'react'

import { useGetTicket } from '@gorgias/helpdesk-queries'

import { useContactReasonPrediction } from './contact-reason-prediction/useContactReasonPrediction'
import { useTicketThreadEvents } from './events/useTicketThreadEvents'
import { useTicketThreadMessages } from './messages/useTicketThreadMessages'
import { useRuleSuggestion } from './rules-suggestions/useRuleSuggestion'
import { useTicketThreadSatisfactionSurveys } from './satisfaction-survey/useTicketThreadSatisfactionSurveys'
import { getQueryOptions } from './shared/queryOption'
import { sortTicketThreadItems } from './sortTicketThread'
import type { TicketThreadItem } from './types'
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
    const { events, hasSatisfactionSurveyRespondedEvent } =
        useTicketThreadEvents({
            ticketId,
        })
    const voiceCalls = useTicketThreadVoiceCalls({ ticketId })
    const satisfactionSurveys = useTicketThreadSatisfactionSurveys({
        ticket,
        hasSatisfactionSurveyRespondedEvent,
    })

    const { insertRuleSuggestion } = useRuleSuggestion({ ticketId })
    const { insertContactReasonPrediction } = useContactReasonPrediction({
        ticketId,
    })

    const ticketThreadItems = useMemo(() => {
        let items: TicketThreadItem[] = sortTicketThreadItems([
            ...messages,
            ...(showTicketEvents ? events : []),
            ...voiceCalls,
            ...satisfactionSurveys,
        ])
        items = [...items, ...activePendingMessages]

        items = insertRuleSuggestion(items)
        items = insertContactReasonPrediction(items)

        return items
    }, [
        messages,
        activePendingMessages,
        events,
        voiceCalls,
        satisfactionSurveys,
        showTicketEvents,
        insertRuleSuggestion,
        insertContactReasonPrediction,
    ])

    return { ticketThreadItems }
}
