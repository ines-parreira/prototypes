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

export type InstagramCommentPrivateReplyData = {
    integrationId: number | null
    messageId: string | null
    ticketMessageId: number
    ticketId: number
    senderId: number
    commentMessage: string
    source: unknown
    sender: unknown
    meta: unknown
    messageCreatedDatetime: string
}

export type InstagramCommentHideCommentData = {
    integrationId: number | null
    messageId: string | null
    ticketId: number
    shouldHide: boolean
}

export type LegacyBridgeContextType = {
    currentTicketShoppingAssistantData: CurrentTicketShoppingAssistantData
    currentTicketRuleSuggestionData: CurrentTicketRuleSuggestionData
    onInstagramCommentPrivateReply?: (
        data: InstagramCommentPrivateReplyData,
    ) => void
    onInstagramCommentHideComment?: (
        data: InstagramCommentHideCommentData,
    ) => void
}
