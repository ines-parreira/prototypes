import { useMemo } from 'react'

import {
    extractOrdersWithIntegration,
    sortOrdersByDateDesc,
} from '@repo/ecommerce/shopify/utils'

import type { Order } from 'constants/integrations/types/shopify'
import type { Customer } from 'models/customer/types'

type ShopifyOrdersSummary = {
    lastOrder: Order | null
    totalCount: number
    unfulfilledCount: number
    integrationId: number | undefined
}

export function useShopifyOrdersSummary(
    customer: Customer | undefined,
): ShopifyOrdersSummary {
    return useMemo(() => {
        if (!customer) {
            return {
                lastOrder: null,
                totalCount: 0,
                unfulfilledCount: 0,
                integrationId: undefined,
            }
        }

        const ordersWithIntegration = extractOrdersWithIntegration<Order>(
            customer.integrations,
        )

        if (ordersWithIntegration.length === 0) {
            return {
                lastOrder: null,
                totalCount: 0,
                unfulfilledCount: 0,
                integrationId: undefined,
            }
        }

        const sorted = sortOrdersByDateDesc(ordersWithIntegration)

        return {
            lastOrder: sorted[0].order,
            totalCount: ordersWithIntegration.length,
            unfulfilledCount: ordersWithIntegration.filter(
                (orderContainer) =>
                    orderContainer.order.fulfillment_status !== 'fulfilled',
            ).length,
            integrationId: sorted[0].integrationId,
        }
    }, [customer])
}
