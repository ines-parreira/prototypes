import { TicketThreadLegacyBridgeProvider } from '@repo/ticket-thread/legacy-bridge'

import { useFetchInfluencedOrdersForCurrentTicket } from 'hooks/aiAgent/useFetchInfluencedOrdersForCurrentTicket'
import useRuleSuggestionForDemos from 'pages/tickets/detail/hooks/useRuleSuggestionForDemos'

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

    return (
        <TicketThreadLegacyBridgeProvider
            currentTicketShoppingAssistantData={{
                influencedOrders: influencedOrders.data ?? [],
                shopifyOrders,
                shopifyIntegrations,
            }}
            currentTicketRuleSuggestionData={{ shouldDisplayDemoSuggestion }}
        >
            {children}
        </TicketThreadLegacyBridgeProvider>
    )
}
