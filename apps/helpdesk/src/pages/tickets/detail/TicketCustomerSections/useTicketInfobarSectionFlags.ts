import { IntegrationType } from '@gorgias/helpdesk-types'

import useAppSelector from 'hooks/useAppSelector'
import useHasCustomIntegrations from 'pages/tickets/detail/hooks/useHasCustomIntegrations'
import useIsIntegrationDisplayable from 'pages/tickets/detail/hooks/useIsIntegrationDisplayable'
import useIsWooCommerceDisplayable from 'pages/tickets/detail/hooks/useIsWooCommerceDisplayable'
import { getIntegrationsByType } from 'state/integrations/selectors'

export type TicketInfobarSectionFlags = {
    hasShopify: boolean
    hasRecharge: boolean
    hasBigCommerce: boolean
    hasMagento: boolean
    hasWooCommerce: boolean
    hasSmile: boolean
    hasYotpo: boolean
    hasCustomIntegrations: boolean
}

export function useTicketInfobarSectionFlags(): TicketInfobarSectionFlags {
    const shopifyIntegrations = useAppSelector(
        getIntegrationsByType(IntegrationType.Shopify),
    )

    return {
        hasShopify: shopifyIntegrations.length > 0,
        hasRecharge: useIsIntegrationDisplayable(IntegrationType.Recharge),
        hasBigCommerce: useIsIntegrationDisplayable(
            IntegrationType.Bigcommerce,
        ),
        hasMagento: useIsIntegrationDisplayable(IntegrationType.Magento2),
        hasWooCommerce: useIsWooCommerceDisplayable(),
        hasSmile: useIsIntegrationDisplayable(IntegrationType.Smile),
        hasYotpo: useIsIntegrationDisplayable(IntegrationType.Yotpo),
        hasCustomIntegrations: useHasCustomIntegrations(),
    }
}
