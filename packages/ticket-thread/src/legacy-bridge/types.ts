import type { ReactNode } from 'react'

import type { VoiceCall } from '@gorgias/helpdesk-queries'

import type {
    TicketThreadAiAgentDraftMessageItem,
    TicketThreadAiAgentHandoverMessageItem,
    TicketThreadAiAgentMessageItem,
    TicketThreadAiAgentTrialMessageItem,
} from '../ticket-messages/types'

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

export type FacebookCommentPrivateReplyData = {
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

export type FacebookCommentHideCommentData = {
    integrationId: number | null
    messageId: string | null
    ticketId: number
    shouldHide: boolean
}

export type FacebookCommentLikeData = {
    integrationId: number | null
    messageId: string | null
    ticketId: number
    shouldLike: boolean
}

// Temporary bridge for helpdesk Redux actions.
// Remove these once equivalent actions live in @repo/tickets or @repo/ticket-thread.
export type LegacyBridgeActions = {
    deleteTicketPendingMessage: (message: unknown) => unknown
    retrySubmitTicketMessage: (message: unknown) => unknown
    undoTicketPendingMessage?: (message: unknown) => unknown
}

export type LegacyBridgeNewMessageState = {
    isSubmittingMessage: boolean
    canUndoTicketPendingMessage?: (message: unknown) => boolean
}

export type LegacyBridgeState = {
    newMessage: LegacyBridgeNewMessageState
}

export type VoiceCallBridgeCallbacks = {
    renderMonitorCallButton?: (voiceCall: VoiceCall) => React.ReactNode
}

export type TicketThreadAiAgentReasoningParams = {
    message: TicketThreadAiAgentMessageItem['data']
}

export type TicketThreadAiAgentDraftMessageParams = {
    message: TicketThreadAiAgentDraftMessageItem['data']
}

export type TicketThreadAiAgentTrialMessageParams = {
    message: TicketThreadAiAgentTrialMessageItem['data']
}

export type TicketThreadAiAgentHandoverSummaryParams = {
    message: TicketThreadAiAgentHandoverMessageItem['data']
}

export type LegacyBridgeContextType = {
    currentTicketShoppingAssistantData: CurrentTicketShoppingAssistantData
    currentTicketRuleSuggestionData: CurrentTicketRuleSuggestionData
    onInstagramCommentPrivateReply: (
        data: InstagramCommentPrivateReplyData,
    ) => void
    onInstagramCommentHideComment: (
        data: InstagramCommentHideCommentData,
    ) => void
    onFacebookCommentPrivateReply: (
        data: FacebookCommentPrivateReplyData,
    ) => void
    onFacebookCommentHideComment: (data: FacebookCommentHideCommentData) => void
    onFacebookCommentLike: (data: FacebookCommentLikeData) => void
    legacyActions: LegacyBridgeActions
    legacyState: LegacyBridgeState
    renderAiAgentDraftMessage?: (
        params: TicketThreadAiAgentDraftMessageParams,
    ) => ReactNode
    renderAiAgentTrialMessage?: (
        params: TicketThreadAiAgentTrialMessageParams,
    ) => ReactNode
    renderAiAgentReasoning?: (
        params: TicketThreadAiAgentReasoningParams,
    ) => ReactNode
    voiceCallCallbacks?: VoiceCallBridgeCallbacks
    renderAiAgentHandoverSummary?: (
        params: TicketThreadAiAgentHandoverSummaryParams,
    ) => ReactNode
}
