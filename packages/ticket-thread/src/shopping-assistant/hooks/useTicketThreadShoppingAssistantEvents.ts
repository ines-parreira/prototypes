import { useMemo } from 'react'

import { useTicketThreadLegacyBridge } from '#legacy-bridge'
import { toTicketThreadInfluencedOrderItems } from '#shopping-assistant/transforms'
import type { TicketThreadShoppingAssistantItem } from '#shopping-assistant/types'

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
