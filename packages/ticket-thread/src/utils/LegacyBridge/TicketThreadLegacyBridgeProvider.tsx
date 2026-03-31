import { LegacyBridgeContext } from './context'
import type {
    CurrentTicketRuleSuggestionData,
    CurrentTicketShoppingAssistantData,
    InstagramCommentHideCommentData,
    InstagramCommentPrivateReplyData,
    LegacyBridgeActions,
    LegacyBridgeState,
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
            }}
        >
            {children}
        </LegacyBridgeContext.Provider>
    )
}
