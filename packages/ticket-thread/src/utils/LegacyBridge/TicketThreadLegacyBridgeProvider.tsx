import { LegacyBridgeContext } from './context'
import type {
    CurrentTicketRuleSuggestionData,
    CurrentTicketShoppingAssistantData,
    FacebookCommentHideCommentData,
    FacebookCommentLikeData,
    FacebookCommentPrivateReplyData,
    InstagramCommentHideCommentData,
    InstagramCommentPrivateReplyData,
    LegacyBridgeActions,
    LegacyBridgeState,
    TicketThreadAiAgentDraftMessageParams,
    TicketThreadAiAgentReasoningParams,
} from './types'

type TicketThreadLegacyBridgeProviderProps = {
    children?: React.ReactNode
    currentTicketShoppingAssistantData: CurrentTicketShoppingAssistantData
    currentTicketRuleSuggestionData?: CurrentTicketRuleSuggestionData
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
    legacyActions?: LegacyBridgeActions
    legacyState?: LegacyBridgeState
    renderAiAgentDraftMessage?: (
        params: TicketThreadAiAgentDraftMessageParams,
    ) => React.ReactNode
    renderAiAgentReasoning?: (
        params: TicketThreadAiAgentReasoningParams,
    ) => React.ReactNode
}

const defaultLegacyActions: LegacyBridgeActions = {
    deleteTicketPendingMessage: () => undefined,
    retrySubmitTicketMessage: () => undefined,
}

const defaultLegacyState: LegacyBridgeState = {
    newMessage: {
        isSubmittingMessage: false,
    },
}

/**
 * This component is used to provide a bridge between the legacy application code in the apps/helpdesk
 * and the new application code in the packages/ticket-thread.
 *
 */
export const TicketThreadLegacyBridgeProvider = ({
    children,
    currentTicketShoppingAssistantData,
    currentTicketRuleSuggestionData = { shouldDisplayDemoSuggestion: true },
    onInstagramCommentPrivateReply,
    onInstagramCommentHideComment,
    onFacebookCommentPrivateReply,
    onFacebookCommentHideComment,
    onFacebookCommentLike,
    legacyActions = defaultLegacyActions,
    legacyState = defaultLegacyState,
    renderAiAgentDraftMessage,
    renderAiAgentReasoning,
}: TicketThreadLegacyBridgeProviderProps) => {
    return (
        <LegacyBridgeContext.Provider
            value={{
                currentTicketShoppingAssistantData,
                currentTicketRuleSuggestionData,
                onInstagramCommentPrivateReply,
                onInstagramCommentHideComment,
                onFacebookCommentPrivateReply,
                onFacebookCommentHideComment,
                onFacebookCommentLike,
                legacyActions,
                legacyState,
                renderAiAgentDraftMessage,
                renderAiAgentReasoning,
            }}
        >
            {children}
        </LegacyBridgeContext.Provider>
    )
}
