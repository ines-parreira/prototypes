import { TicketThreadItemTag } from '../../thread/itemTags'
import { InfluencedOrderSource } from '../constants'
import {
    influencedOrderSchema,
    shopifyIntegrationSchema,
    shopifyOrderSchema,
} from '../schemas'
import type {
    TicketThreadInfluencedOrderItem,
    TicketThreadShoppingAssistantSources,
} from '../types'

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

export function toTicketThreadInfluencedOrderItems({
    ticketId,
    influencedOrders,
    shopifyOrders,
    shopifyIntegrations,
}: TicketThreadShoppingAssistantSources): TicketThreadInfluencedOrderItem[] {
    const normalizedInfluencedOrders = (influencedOrders ?? []).flatMap(
        (influencedOrder) => {
            const result = influencedOrderSchema.safeParse(influencedOrder)

            return result.success ? [result.data] : []
        },
    )
    const normalizedShopifyOrders = (shopifyOrders ?? []).flatMap(
        (shopifyOrder) => {
            const result = shopifyOrderSchema.safeParse(shopifyOrder)

            return result.success ? [result.data] : []
        },
    )
    const normalizedShopifyIntegrations = (shopifyIntegrations ?? []).flatMap(
        (shopifyIntegration) => {
            const result =
                shopifyIntegrationSchema.safeParse(shopifyIntegration)

            return result.success ? [result.data] : []
        },
    )

    if (
        !ticketId ||
        !normalizedInfluencedOrders.length ||
        !normalizedShopifyOrders.length ||
        !normalizedShopifyIntegrations.length
    ) {
        return []
    }

    return normalizedInfluencedOrders.reduce<TicketThreadInfluencedOrderItem[]>(
        (items, influencedOrder) => {
            if (influencedOrder.ticketId !== ticketId) {
                return items
            }

            const order = normalizedShopifyOrders.find(
                (shopifyOrder) => shopifyOrder.id === influencedOrder.id,
            )
            const integration = normalizedShopifyIntegrations.find(
                (shopifyIntegration) =>
                    shopifyIntegration.id === influencedOrder.integrationId,
            )

            if (!order || !integration) {
                return items
            }

            const createdDatetime = influencedOrder.createdDatetime

            items.push({
                _tag: TicketThreadItemTag.ShoppingAssistant.InfluencedOrder,
                data: {
                    orderId: influencedOrder.id,
                    orderNumber: order.order_number,
                    shopName: integration.name,
                    created_datetime: createdDatetime,
                    influencedBy: sourceToInfluencedOrderSource(
                        influencedOrder.source,
                    ),
                },
                datetime: createdDatetime,
            })

            return items
        },
        [],
    )
}
