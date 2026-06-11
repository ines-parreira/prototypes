import { useCanAccessAIFeedback } from '@repo/ai-agent'
import { Panel } from '@repo/layout'
import { TicketInfobarNavigation } from '@repo/tickets'

import { IntegrationType } from '@gorgias/helpdesk-types'

import { useAppSelector } from 'hooks/useAppSelector'
import { useHasAIAgent } from 'pages/tickets/detail/components/TicketFeedback/hooks/useHasAIAgent'
import { useHasCustomIntegrations } from 'pages/tickets/detail/hooks/useHasCustomIntegrations'
import { useIsIntegrationDisplayable } from 'pages/tickets/detail/hooks/useIsIntegrationDisplayable'
import { useIsWooCommerceDisplayable } from 'pages/tickets/detail/hooks/useIsWooCommerceDisplayable'
import { getIntegrationsByType } from 'state/integrations/selectors'

const panelConfig = {
    defaultSize: 49,
    minSize: 49,
    maxSize: 49,
}

export function InfobarNavigationPanel() {
    const hasAIAgent = useHasAIAgent()
    const canAccessAIFeedback = useCanAccessAIFeedback()

    const hasCustomIntegrations = useHasCustomIntegrations()
    const shopifyIntegrations = useAppSelector(
        getIntegrationsByType(IntegrationType.Shopify),
    )
    const hasShopify = shopifyIntegrations.length > 0
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
                hasWooCommerce={hasWooCommerce}
                hasYotpo={hasYotpo}
            />
        </Panel>
    )
}
