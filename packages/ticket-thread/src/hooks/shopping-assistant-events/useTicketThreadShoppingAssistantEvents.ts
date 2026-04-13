import { useMemo } from 'react'

import { useTicketThreadLegacyBridge } from '../../utils/LegacyBridge'
import { toTicketThreadInfluencedOrderItems } from './transforms'
import type { TicketThreadShoppingAssistantItem } from './types'

type UseTicketThreadShoppingAssistantEventsParams = {
    ticketId: number
}

export function useTicketThreadShoppingAssistantEvents({
    ticketId,
}: UseTicketThreadShoppingAssistantEventsParams): {
    items: TicketThreadShoppingAssistantItem[]
} {
    const {
        currentTicketShoppingAssistantData: {
            influencedOrders,
            shopifyOrders,
            shopifyIntegrations,
        },
    } = useTicketThreadLegacyBridge()

    const items = useMemo(
        () =>
            toTicketThreadInfluencedOrderItems({
                ticketId,
                influencedOrders,
                shopifyOrders,
                shopifyIntegrations,
            }),
        [ticketId, influencedOrders, shopifyOrders, shopifyIntegrations],
    )

    return { items }
}
