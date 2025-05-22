import { useMemo } from 'react'

import { InfluencedOrderData } from 'hooks/aiAgent/useFetchInfluencedOrders'
import { useFetchInfluencedOrdersForCurrentTicket } from 'hooks/aiAgent/useFetchInfluencedOrdersForCurrentTicket'
import { ShopifyIntegration } from 'models/integration/types'
import { TicketElement, TicketMessage } from 'models/ticket/types'

export type ShoppingAssistantEvent = {
    type: 'influenced-order'
    isShoppingAssistantEvent: boolean
    created_datetime: string
    data: {
        orderId: number
        orderNumber: number
        shopName: string
        createdDatetime: string
    }
}

/**
 * This hook is used to insert shopping assistant events chronologically with the body elements
 * @returns The body elements with the shopping assistant events inserted
 */
export const useInsertShoppingAssistantEventElements = (
    bodyElements: (TicketElement | TicketMessage[])[],
) => {
    const {
        influencedOrders: { data: influencedOrders },
        ticketContext: { customerIds, shopifyIntegrations, orders },
    } = useFetchInfluencedOrdersForCurrentTicket()

    return useMemo(() => {
        // Defensive programming to avoid type errors because the ticket state is not typed
        if (
            !customerIds?.length ||
            !shopifyIntegrations?.length ||
            !orders.length ||
            !influencedOrders?.length
        ) {
            return bodyElements
        }

        const influencedOrderEvents = influencedOrders.reduce(
            (events, influencedOrder) => {
                const event = buildInfluencedOrderEvent(
                    influencedOrder,
                    orders,
                    shopifyIntegrations,
                )

                if (event) {
                    events.push(event)
                }

                return events
            },
            [] as ShoppingAssistantEvent[],
        )

        const allElements = [...bodyElements, ...influencedOrderEvents]

        const sortedElements = allElements.sort((a, b) => {
            const createdDatetimeA = Array.isArray(a)
                ? a[0].created_datetime
                : a.created_datetime
            const aTimestamp = new Date(createdDatetimeA).getTime()

            const createdDatetimeB = Array.isArray(b)
                ? b[0].created_datetime
                : b.created_datetime
            const bTimestamp = new Date(createdDatetimeB).getTime()

            return aTimestamp - bTimestamp
        })

        return sortedElements
    }, [
        bodyElements,
        influencedOrders,
        orders,
        customerIds,
        shopifyIntegrations,
    ])
}

const buildInfluencedOrderEvent = (
    influencedOrder: InfluencedOrderData,
    shopifyOrders: Record<string, any>[],
    shopifyIntegrations: ShopifyIntegration[],
): ShoppingAssistantEvent | undefined => {
    const shopifyOrder = shopifyOrders.find(
        (order: any) => order.id === influencedOrder.id,
    )
    const shopifyIntegration = shopifyIntegrations.find(
        (integration) => integration.id === influencedOrder.integrationId,
    )

    if (typeof shopifyOrder?.order_number !== 'number' || !shopifyIntegration) {
        return undefined
    }

    const createdDatetime = influencedOrder.createdDatetime

    return {
        isShoppingAssistantEvent: true,
        type: 'influenced-order',
        created_datetime: createdDatetime,
        data: {
            orderId: influencedOrder.id,
            orderNumber: shopifyOrder.order_number,
            shopName: shopifyIntegration.name,
            createdDatetime,
        },
    }
}
