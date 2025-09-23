import useAppSelector from 'hooks/useAppSelector'
import { useIsAccountDeactivated } from 'hooks/useIsAccountDeactivated'
import { IntegrationType } from 'models/integration/constants'
import { hasIntegrationOfTypes } from 'state/integrations/selectors'

export const useHasAiAgentMenu = () => {
    const isAccountDeactivated = useIsAccountDeactivated()
    const hasMagentoIntegration = useAppSelector(
        hasIntegrationOfTypes(IntegrationType.Magento2),
    )
    const hasBigCommerceIntegration = useAppSelector(
        hasIntegrationOfTypes(IntegrationType.BigCommerce),
    )
    const hasShopifyIntegration = useAppSelector(
        hasIntegrationOfTypes(IntegrationType.Shopify),
    )

    const hasMagentoOrBigCommerceIntegration =
        hasMagentoIntegration || hasBigCommerceIntegration

    if (isAccountDeactivated) {
        return false
    }
    return hasShopifyIntegration || !hasMagentoOrBigCommerceIntegration
}
