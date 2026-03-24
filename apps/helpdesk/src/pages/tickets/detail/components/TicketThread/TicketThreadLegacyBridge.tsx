import { TicketThreadLegacyBridgeProvider } from '@repo/ticket-thread/legacy-bridge'

import { useFetchInfluencedOrdersForCurrentTicket } from 'hooks/aiAgent/useFetchInfluencedOrdersForCurrentTicket'
import useRuleSuggestionForDemos from 'pages/tickets/detail/hooks/useRuleSuggestionForDemos'

import { InstagramCommentPrivateReplyModal } from './InstagramCommentPrivateReplyModal'
import { useInstagramCommentActions } from './useInstagramCommentActions'

type TicketThreadLegacyBridgeProps = {
    children: React.ReactNode
}

export const TicketThreadLegacyBridge = ({
    children,
}: TicketThreadLegacyBridgeProps) => {
    const {
        influencedOrders,
        ticketContext: { orders: shopifyOrders, shopifyIntegrations, ticketId },
    } = useFetchInfluencedOrdersForCurrentTicket()
    const { shouldDisplayDemoSuggestion } = useRuleSuggestionForDemos(
        ticketId ?? 0,
        true,
    )

    const {
        privateReplyData,
        handlePrivateReply,
        handlePrivateReplyToggle,
        handleHideComment,
    } = useInstagramCommentActions()

    return (
        <TicketThreadLegacyBridgeProvider
            currentTicketShoppingAssistantData={{
                influencedOrders: influencedOrders.data ?? [],
                shopifyOrders,
                shopifyIntegrations,
            }}
            currentTicketRuleSuggestionData={{ shouldDisplayDemoSuggestion }}
            onInstagramCommentPrivateReply={handlePrivateReply}
            onInstagramCommentHideComment={handleHideComment}
        >
            {children}
            {privateReplyData && (
                <InstagramCommentPrivateReplyModal
                    data={privateReplyData}
                    onToggle={handlePrivateReplyToggle}
                />
            )}
        </TicketThreadLegacyBridgeProvider>
    )
}
