import { LegacyBridgeContext } from './context'
import type {
    CurrentTicketRuleSuggestionData,
    CurrentTicketShoppingAssistantData,
    InstagramCommentHideCommentData,
    InstagramCommentPrivateReplyData,
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
}: TicketThreadLegacyBridgeProviderProps) => {
    return (
        <LegacyBridgeContext.Provider
            value={{
                currentTicketShoppingAssistantData,
                currentTicketRuleSuggestionData,
                onInstagramCommentPrivateReply,
                onInstagramCommentHideComment,
            }}
        >
            {children}
        </LegacyBridgeContext.Provider>
    )
}
