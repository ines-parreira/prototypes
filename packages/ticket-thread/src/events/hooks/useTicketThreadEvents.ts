import { useMemo } from 'react'

import { useGetTicket } from '@repo/tickets/useGetTicket'
import { useAllUsers } from '@repo/users'
import {
    isAuditLogEvent,
    isNonRenderablePrivateReplyEvent,
    isSatisfactionSurveyRespondedEvent,
    isViaRuleEvent,
} from '../predicates'
import { shouldRenderTicketThreadEvent, toTaggedEvent } from '../transforms'
import type {
    TicketThreadAuditLogAttribution,
    TicketThreadAuditLogEvent,
    TicketThreadEventSource,
    TicketThreadSingleEventItem,
} from '../types'
import { useListAllTicketEvents } from './useListAllEvents'

type EventIdentifier = number | string
type AuditLogAttributionUser = {
    id?: number
    role?: {
        name?: string | null
    } | null
}

const BOT_USER_ROLE = 'bot'

type TicketObjectEvent = {
    id?: EventIdentifier
    object_type?: string
    type?: string
    user?: {
        id?: unknown
    } | null
    user_id?: number | null
    [key: string]: unknown
}

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
    users: readonly AuditLogAttributionUser[],
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

    if (isSystemAddedTagEvent(event, users)) {
        return 'system'
    }

    if (event.user_id != null) {
        return 'author'
    }

    if (event.data?.auto_assigned) {
        return 'via-team-auto-assignment'
    }

    return 'none'
}

function isSystemAddedTagEvent(
    event: TicketThreadAuditLogEvent,
    users: readonly AuditLogAttributionUser[],
): boolean {
    if (event.type !== 'ticket-tags-added') {
        return false
    }

    if (event.data?.type === 'system') {
        return true
    }

    if (event.user_id == null) {
        return false
    }

    const eventUser = users.find((user) => user.id === event.user_id)

    return eventUser?.role?.name === BOT_USER_ROLE
}

function getEventIdentifier(event: unknown): EventIdentifier | null {
    if (!event || typeof event !== 'object' || !('id' in event)) {
        return null
    }

    const id = event.id

    if (typeof id !== 'number' && typeof id !== 'string') {
        return null
    }

    return id
}

function getTicketObjectEventUserId(event: TicketObjectEvent): number | null {
    if (typeof event.user?.id !== 'number') {
        return null
    }

    return event.user.id
}

function normalizeTicketObjectEvent(
    event: TicketObjectEvent,
): TicketThreadEventSource {
    return {
        ...event,
        object_type: event.object_type ?? 'ticket',
        user_id:
            event.user_id !== undefined
                ? event.user_id
                : getTicketObjectEventUserId(event),
    } as TicketThreadEventSource
}

function mergeTicketEvents(
    events: readonly TicketThreadEventSource[],
    ticketObjectEvents: readonly TicketObjectEvent[],
): TicketThreadEventSource[] {
    const eventIds = new Set(
        events
            .map(getEventIdentifier)
            .filter((id): id is EventIdentifier => id != null),
    )

    const normalizedTicketObjectEvents = ticketObjectEvents
        .map(normalizeTicketObjectEvent)
        .filter((event) => {
            const eventId = getEventIdentifier(event)

            return eventId == null || !eventIds.has(eventId)
        })

    return [...events, ...normalizedTicketObjectEvents]
}

export function useTicketThreadEvents({
    ticketId,
}: UseTicketThreadEventsParams): UseTicketThreadEventsResult {
    const { data: events } = useListAllTicketEvents(ticketId)
    const { data: ticket } = useGetTicket(ticketId)
    const users = useAllUsers()

    return useMemo(() => {
        let hasSatisfactionSurveyRespondedEvent = false
        const rawTicketEvents = mergeTicketEvents(
            events ?? [],
            ticket?.data?.events ?? [],
        )
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
                        users,
                    ),
                })
            })
            .filter((item): item is TicketThreadSingleEventItem => !!item)

        return { events: items, hasSatisfactionSurveyRespondedEvent }
    }, [events, ticket, users])
}
