import { useMemo } from 'react'

import type { Event } from '@gorgias/helpdesk-queries'
import { ObjectType, useListEvents } from '@gorgias/helpdesk-queries'

import { useTicketThreadLegacyBridge } from '../../utils/LegacyBridge'
import { getQueryOptions } from '../shared/queryOption'
import {
    isNonRenderablePrivateReplyEvent,
    isSatisfactionSurveyRespondedEvent,
} from './predicates'
import {
    shouldRenderTicketThreadEvent,
    toShoppingAssistantEvents,
    toTaggedEvent,
} from './transforms'
import type {
    TicketThreadEventItem,
    TicketThreadShoppingAssistantEventSources,
} from './types'

type UseTicketThreadEventsParams = TicketThreadShoppingAssistantEventSources

type UseTicketThreadEventsResult = {
    events: TicketThreadEventItem[]
    hasSatisfactionSurveyRespondedEvent: boolean
}

export function useTicketThreadEvents({
    ticketId,
}: UseTicketThreadEventsParams): UseTicketThreadEventsResult {
    const {
        currentTicketShoppingAssistantData: {
            influencedOrders,
            shopifyOrders,
            shopifyIntegrations,
        },
    } = useTicketThreadLegacyBridge()
    const { data: events } = useListEvents(
        {
            object_id: ticketId,
            object_type: ObjectType.Ticket,
        },
        {
            query: {
                ...getQueryOptions(ticketId),
                select: (data): Event[] => data?.data?.data ?? [],
            },
        },
    )

    return useMemo(() => {
        let hasSatisfactionSurveyRespondedEvent = false

        const shoppingAssistantEvents = toShoppingAssistantEvents({
            ticketId,
            influencedOrders,
            shopifyOrders,
            shopifyIntegrations,
        })

        const items = [...(events ?? []), ...shoppingAssistantEvents]
            .filter((event) => !isNonRenderablePrivateReplyEvent(event))
            .filter(shouldRenderTicketThreadEvent)
            .map((event): TicketThreadEventItem => {
                if (isSatisfactionSurveyRespondedEvent(event)) {
                    hasSatisfactionSurveyRespondedEvent = true
                }

                return toTaggedEvent(event)
            })

        return { events: items, hasSatisfactionSurveyRespondedEvent }
    }, [events, ticketId, influencedOrders, shopifyOrders, shopifyIntegrations])
}
