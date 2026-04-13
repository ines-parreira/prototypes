import { useMemo } from 'react'

import {
    isAuditLogEvent,
    isNonRenderablePrivateReplyEvent,
    isSatisfactionSurveyRespondedEvent,
    isViaRuleEvent,
} from './predicates'
import { shouldRenderTicketThreadEvent, toTaggedEvent } from './transforms'
import type {
    TicketThreadAuditLogAttribution,
    TicketThreadSingleEventItem,
} from './types'
import { useListAllTicketEvents } from './useListAllEvents'

type UseTicketThreadEventsParams = {
    ticketId: number
}

type UseTicketThreadEventsResult = {
    events: TicketThreadSingleEventItem[]
    hasSatisfactionSurveyRespondedEvent: boolean
}

function getAuditLogAttribution(
    event: unknown,
    allTicketEvents: readonly unknown[],
): TicketThreadAuditLogAttribution {
    if (!isAuditLogEvent(event)) {
        return 'none'
    }

    const isRuleSuggestionEvent =
        event.type === 'rule-suggestion-suggested' ||
        (event.type === 'rule-executed' && !!event.data?.slug)

    if (event.type === 'rule-executed' || isRuleSuggestionEvent) {
        return 'none'
    }

    if (isViaRuleEvent(event, allTicketEvents)) {
        return 'via-rule'
    }

    if (event.user_id != null) {
        return 'author'
    }

    return 'none'
}

export function useTicketThreadEvents({
    ticketId,
}: UseTicketThreadEventsParams): UseTicketThreadEventsResult {
    const { data: events } = useListAllTicketEvents(ticketId)

    return useMemo(() => {
        let hasSatisfactionSurveyRespondedEvent = false
        const rawTicketEvents = events ?? []
        const items = rawTicketEvents
            .filter((event) => !isNonRenderablePrivateReplyEvent(event))
            .filter(shouldRenderTicketThreadEvent)
            .map((event): TicketThreadSingleEventItem => {
                if (isSatisfactionSurveyRespondedEvent(event)) {
                    hasSatisfactionSurveyRespondedEvent = true
                    return null as never
                }

                if (!isAuditLogEvent(event)) {
                    return toTaggedEvent(event)
                }

                return toTaggedEvent(event, {
                    auditLogAttribution: getAuditLogAttribution(
                        event,
                        rawTicketEvents,
                    ),
                })
            })
            .filter((item): item is TicketThreadSingleEventItem => !!item)

        return { events: items, hasSatisfactionSurveyRespondedEvent }
    }, [events])
}
