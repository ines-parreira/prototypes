import type { Prettify } from '@repo/types'
import { slidingWindow } from '@repo/utils'

import type { Event } from '@gorgias/helpdesk-queries'

import type { TicketThreadItem } from '../types'
import { TicketThreadItemTag } from '../types'
import { InfluencedOrderSource } from './constants'
import {
    isActionNameEvent,
    isAuditLogEvent,
    isInfluencedOrder,
    isPhoneEvent,
    isPrivateReplyEvent,
    isSatisfactionSurveyRespondedEvent,
    isShopifyIntegration,
    isShopifyOrder,
    isShoppingAssistantEvent,
    isSingleEventItem,
} from './predicates'
import type { ShoppingAssistantEventSchema, TicketEventSchema } from './schemas'
import type {
    TicketThreadAuditLogAttribution,
    TicketThreadAuditLogEvent,
    TicketThreadAuditLogEventItem,
    TicketThreadEventSource,
    TicketThreadShoppingAssistantEventSources,
    TicketThreadSingleEventItem,
} from './types'

function sourceToInfluencedOrderSource(
    source: string | null | undefined,
): InfluencedOrderSource {
    switch (source) {
        case InfluencedOrderSource.AI_JOURNEY:
            return InfluencedOrderSource.AI_JOURNEY
        case InfluencedOrderSource.AI_AGENT:
            return InfluencedOrderSource.AI_AGENT
        case InfluencedOrderSource.SHOPPING_ASSISTANT:
            return InfluencedOrderSource.SHOPPING_ASSISTANT
        default:
            return InfluencedOrderSource.SHOPPING_ASSISTANT
    }
}

export function toShoppingAssistantEvents({
    ticketId,
    influencedOrders,
    shopifyOrders,
    shopifyIntegrations,
}: TicketThreadShoppingAssistantEventSources): ShoppingAssistantEventSchema[] {
    const normalizedInfluencedOrders = (influencedOrders ?? []).filter(
        isInfluencedOrder,
    )
    const normalizedShopifyOrders = (shopifyOrders ?? []).filter(isShopifyOrder)
    const normalizedShopifyIntegrations = (shopifyIntegrations ?? []).filter(
        isShopifyIntegration,
    )

    if (
        !ticketId ||
        !normalizedInfluencedOrders.length ||
        !normalizedShopifyOrders.length ||
        !normalizedShopifyIntegrations.length
    ) {
        return []
    }

    return normalizedInfluencedOrders.reduce<ShoppingAssistantEventSchema[]>(
        (events, influencedOrder) => {
            if (influencedOrder.ticketId !== ticketId) {
                return events
            }

            const order = normalizedShopifyOrders.find(
                (shopifyOrder) => shopifyOrder.id === influencedOrder.id,
            )
            const integration = normalizedShopifyIntegrations.find(
                (shopifyIntegration) =>
                    shopifyIntegration.id === influencedOrder.integrationId,
            )

            if (!order || !integration) {
                return events
            }

            const createdDatetime = influencedOrder.createdDatetime

            events.push({
                orderId: influencedOrder.id,
                orderNumber: order.order_number,
                shopName: integration.name,
                created_datetime: createdDatetime,
                influencedBy: sourceToInfluencedOrderSource(
                    influencedOrder.source,
                ),
            })

            return events
        },
        [],
    )
}

export function toTaggedEvent(
    event: TicketThreadEventSource,
    options?: {
        auditLogAttribution?: TicketThreadAuditLogAttribution
    },
): TicketThreadSingleEventItem {
    const datetime = event.created_datetime ?? ''

    if (isShoppingAssistantEvent(event)) {
        return {
            _tag: TicketThreadItemTag.Events.ShoppingAssistantEvent,
            data: event,
            datetime,
        }
    }

    if (isPhoneEvent(event)) {
        return {
            _tag: TicketThreadItemTag.Events.PhoneEvent,
            data: event,
            datetime,
        }
    }

    if (isPrivateReplyEvent(event)) {
        return {
            _tag: TicketThreadItemTag.Events.PrivateReplyEvent,
            data: event,
            datetime,
        }
    }

    if (isSatisfactionSurveyRespondedEvent(event)) {
        return {
            _tag: TicketThreadItemTag.Events.SatisfactionSurveyRespondedEvent,
            data: event,
            datetime,
        }
    }

    if (isAuditLogEvent(event)) {
        const auditLogEvent = event as TicketThreadAuditLogEvent

        return {
            _tag: TicketThreadItemTag.Events.AuditLogEvent,
            type: auditLogEvent.type,
            data: auditLogEvent,
            datetime,
            meta: {
                attribution: options?.auditLogAttribution ?? 'none',
            },
        } as TicketThreadAuditLogEventItem
    }

    return {
        _tag: TicketThreadItemTag.Events.TicketEvent,
        data: event as Prettify<Event & TicketEventSchema>,
        datetime,
    }
}

export function groupConsecutiveEvents(
    items: TicketThreadItem[],
): TicketThreadItem[] {
    const groupedItems: TicketThreadItem[] = []

    for (const [item, previousItem] of slidingWindow(items)) {
        if (
            previousItem &&
            isSingleEventItem(previousItem) &&
            isSingleEventItem(item)
        ) {
            const previousGroupedItem = groupedItems[groupedItems.length - 1]

            if (
                previousGroupedItem?._tag ===
                TicketThreadItemTag.Events.GroupedEvents
            ) {
                previousGroupedItem.data.push(item)
            } else {
                groupedItems[groupedItems.length - 1] = {
                    _tag: TicketThreadItemTag.Events.GroupedEvents,
                    data: [previousItem, item],
                    datetime: previousItem.datetime,
                }
            }

            continue
        }

        groupedItems.push(item)
    }

    return groupedItems
}

export function shouldRenderTicketThreadEvent(
    event: TicketThreadEventSource,
): boolean {
    return (
        isShoppingAssistantEvent(event) ||
        isPhoneEvent(event) ||
        isPrivateReplyEvent(event) ||
        isSatisfactionSurveyRespondedEvent(event) ||
        isAuditLogEvent(event) ||
        isActionNameEvent(event)
    )
}
