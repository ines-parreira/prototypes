import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import { hasIntegrationOfTypes } from 'state/integrations/selectors'

export const useHasMagentoOrBigCommerceIntegration = () => {
    const hasMagentoIntegration = useAppSelector(
        hasIntegrationOfTypes(IntegrationType.Magento2),
    )
    const hasBigCommerceIntegration = useAppSelector(
        hasIntegrationOfTypes(IntegrationType.BigCommerce),
    )

    return hasMagentoIntegration || hasBigCommerceIntegration
}
