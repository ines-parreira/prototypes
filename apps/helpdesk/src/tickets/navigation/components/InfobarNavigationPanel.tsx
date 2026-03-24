import { useCanAccessAIFeedback } from '@repo/ai-agent'
import { Panel } from '@repo/layout'
import { TicketInfobarNavigation } from '@repo/tickets'
import { useParams } from 'react-router-dom'

import { IntegrationType, useGetTicket } from '@gorgias/helpdesk-queries'

import useHasAIAgent from 'pages/tickets/detail/components/TicketFeedback/hooks/useHasAIAgent'
import useHasIntegration from 'pages/tickets/detail/hooks/useHasIntegration'
import useHasRecharge from 'pages/tickets/detail/hooks/useHasRecharge'
import useHasWooCommerce from 'pages/tickets/detail/hooks/useHasWooCommerce'

const panelConfig = {
    defaultSize: 49,
    minSize: 49,
    maxSize: 49,
}

export function InfobarNavigationPanel() {
    const hasAIAgent = useHasAIAgent()
    const canAccessAIFeedback = useCanAccessAIFeedback()
    const { ticketId: activeTicketId } = useParams<{ ticketId?: string }>()
    const ticketId = activeTicketId ? Number(activeTicketId) : undefined

    const { data: currentTicketData } = useGetTicket(ticketId!, undefined, {
        query: {
            enabled: ticketId !== undefined,
        },
    })

    const shopperId = currentTicketData?.data?.customer?.id

    const hasShopify = useHasIntegration(IntegrationType.Shopify)
    const hasRecharge = useHasRecharge()
    const hasBigCommerce = useHasIntegration(IntegrationType.Bigcommerce)
    const hasMagento = useHasIntegration(IntegrationType.Magento2)
    const hasWooCommerce = useHasWooCommerce()
    const hasSmile = useHasIntegration(IntegrationType.Smile)
    const hasYotpo = useHasIntegration(IntegrationType.Yotpo)

    return (
        <Panel name="infobar-navigation" config={panelConfig}>
            <TicketInfobarNavigation
                hasAIFeedback={hasAIAgent && canAccessAIFeedback}
                hasBigCommerce={hasBigCommerce}
                hasMagento={hasMagento}
                hasRecharge={hasRecharge}
                hasShopify={hasShopify}
                hasSmile={hasSmile}
                hasTimeline={!!shopperId}
                hasWooCommerce={hasWooCommerce}
                hasYotpo={hasYotpo}
            />
        </Panel>
    )
}
