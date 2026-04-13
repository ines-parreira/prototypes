import type {
    LegacyBridgeInfluencedOrder,
    LegacyBridgeShopifyIntegration,
    LegacyBridgeShopifyOrder,
} from '../../utils/LegacyBridge'
import type { TicketThreadItemTag } from '../types'
import type { TicketThreadInfluencedOrderSchema } from './schemas'

export type TicketThreadInfluencedOrderItem = {
    _tag: typeof TicketThreadItemTag.ShoppingAssistant.InfluencedOrder
    data: TicketThreadInfluencedOrderSchema
    datetime: string
}

export type TicketThreadShoppingAssistantItem = TicketThreadInfluencedOrderItem

export type TicketThreadShoppingAssistantSources = {
    ticketId: number
    influencedOrders?: LegacyBridgeInfluencedOrder[]
    shopifyOrders?: LegacyBridgeShopifyOrder[]
    shopifyIntegrations?: LegacyBridgeShopifyIntegration[]
}
