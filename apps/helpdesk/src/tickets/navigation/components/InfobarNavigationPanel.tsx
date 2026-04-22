import { useCanAccessAIFeedback } from '@repo/ai-agent'
import { Panel } from '@repo/layout'
import { TicketInfobarNavigation } from '@repo/tickets'
import { useParams } from 'react-router-dom'

import { useGetTicket } from '@gorgias/helpdesk-queries'
import { IntegrationType } from '@gorgias/helpdesk-types'

import useHasAIAgent from 'pages/tickets/detail/components/TicketFeedback/hooks/useHasAIAgent'
import useHasCustomIntegrations from 'pages/tickets/detail/hooks/useHasCustomIntegrations'
import useHasIntegration from 'pages/tickets/detail/hooks/useHasIntegration'
import useIsIntegrationDisplayable from 'pages/tickets/detail/hooks/useIsIntegrationDisplayable'
import useIsWooCommerceDisplayable from 'pages/tickets/detail/hooks/useIsWooCommerceDisplayable'

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

    const hasCustomIntegrations = useHasCustomIntegrations()
    const hasShopify = useHasIntegration(IntegrationType.Shopify)
    const hasRecharge = useIsIntegrationDisplayable(IntegrationType.Recharge)
    const hasBigCommerce = useIsIntegrationDisplayable(
        IntegrationType.Bigcommerce,
    )
    const hasMagento = useIsIntegrationDisplayable(IntegrationType.Magento2)
    const hasWooCommerce = useIsWooCommerceDisplayable()
    const hasSmile = useIsIntegrationDisplayable(IntegrationType.Smile)
    const hasYotpo = useIsIntegrationDisplayable(IntegrationType.Yotpo)

    return (
        <Panel name="infobar-navigation" config={panelConfig}>
            <TicketInfobarNavigation
                hasAIFeedback={hasAIAgent && canAccessAIFeedback}
                hasBigCommerce={hasBigCommerce}
                hasCustomIntegrations={hasCustomIntegrations}
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
