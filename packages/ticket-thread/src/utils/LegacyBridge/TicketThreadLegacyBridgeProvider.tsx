import { LegacyBridgeContext } from './context'
import type {
    CurrentTicketRuleSuggestionData,
    CurrentTicketShoppingAssistantData,
    InstagramCommentHideCommentData,
    InstagramCommentPrivateReplyData,
    LegacyBridgeActions,
    LegacyBridgeState,
    TicketThreadAiAgentReasoningParams,
} from './types'

type TicketThreadLegacyBridgeProviderProps = {
    children?: React.ReactNode
    currentTicketShoppingAssistantData: CurrentTicketShoppingAssistantData
    currentTicketRuleSuggestionData?: CurrentTicketRuleSuggestionData
    onInstagramCommentPrivateReply?: (
        data: InstagramCommentPrivateReplyData,
    ) => void
    onInstagramCommentHideComment?: (
        data: InstagramCommentHideCommentData,
    ) => void
    legacyActions?: LegacyBridgeActions
    legacyState?: LegacyBridgeState
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
    legacyActions = defaultLegacyActions,
    legacyState = defaultLegacyState,
    renderAiAgentReasoning,
}: TicketThreadLegacyBridgeProviderProps) => {
    return (
        <LegacyBridgeContext.Provider
            value={{
                currentTicketShoppingAssistantData,
                currentTicketRuleSuggestionData,
                onInstagramCommentPrivateReply,
                onInstagramCommentHideComment,
                legacyActions,
                legacyState,
                renderAiAgentReasoning,
            }}
        >
            {children}
        </LegacyBridgeContext.Provider>
    )
}
