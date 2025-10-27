import { useMemo } from 'react'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType, StoreIntegration } from 'models/integration/types'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

const useStoreIntegrations = (types?: IntegrationType[]) => {
    const { hasAccess } = useAiAgentAccess()

    const getStoreIntegrations = useMemo(
        () =>
            getIntegrationsByTypes(
                types
                    ? types
                    : hasAccess
                      ? [
                            IntegrationType.Shopify,
                            IntegrationType.BigCommerce,
                            IntegrationType.Magento2,
                        ]
                      : [IntegrationType.Shopify],
            ),
        [types, hasAccess],
    )

    return useAppSelector(getStoreIntegrations) as StoreIntegration[]
}

export default useStoreIntegrations
