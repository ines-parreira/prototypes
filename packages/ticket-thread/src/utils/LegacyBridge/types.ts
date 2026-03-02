import type { DateTimeResultFormatType } from '@repo/utils'

export type LegacyBridgeInfluencedOrder = {
    id: number
    integrationId: number
    ticketId: number
    createdDatetime: string
    source: string | null | undefined
}

export type LegacyBridgeShopifyOrder = {
    id: number
    order_number: number
    created_at?: string
    updated_at?: string
}

export type LegacyBridgeShopifyIntegration = {
    id: number
    name: string
}

export type CurrentTicketShoppingAssistantData = {
    influencedOrders: LegacyBridgeInfluencedOrder[]
    shopifyOrders: LegacyBridgeShopifyOrder[]
    shopifyIntegrations: LegacyBridgeShopifyIntegration[]
}

export type CurrentTicketRuleSuggestionData = {
    shouldDisplayDemoSuggestion: boolean
}

export type LegacyBridgeContextType = {
    currentTicketShoppingAssistantData: CurrentTicketShoppingAssistantData
    currentTicketRuleSuggestionData: CurrentTicketRuleSuggestionData
    datetimeFormat: DateTimeResultFormatType
}
