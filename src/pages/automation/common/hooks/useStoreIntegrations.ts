import {useMemo} from 'react'

import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {IntegrationType, StoreIntegration} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'

const useStoreIntegrations = () => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const getStoreIntegrations = useMemo(
        () =>
            getIntegrationsByTypes(
                hasAutomate
                    ? [
                          IntegrationType.Shopify,
                          IntegrationType.BigCommerce,
                          IntegrationType.Magento2,
                      ]
                    : [IntegrationType.Shopify]
            ),
        [hasAutomate]
    )

    return useAppSelector(getStoreIntegrations) as StoreIntegration[]
}

export default useStoreIntegrations
