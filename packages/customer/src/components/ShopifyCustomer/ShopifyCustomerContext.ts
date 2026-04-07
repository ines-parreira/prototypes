import { createContext } from 'react'

import type { OrderData, ShopperData } from './types'

export type ShopifyCustomerContextType = {
    onCreateOrder?: (integrationId: number, shopperData: ShopperData) => void
    onEditOrder?: (integrationId: number, order: OrderData) => void
    onDuplicateOrder?: (integrationId: number, order: OrderData) => void
    onRefundOrder?: (integrationId: number, order: OrderData) => void
    onCancelOrder?: (integrationId: number, order: OrderData) => void
}

export const ShopifyCustomerContext = createContext<ShopifyCustomerContextType>(
    {},
)
