import { useMemo } from 'react'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { useAppSelector } from 'hooks/useAppSelector'
import type { StoreIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

export const STORE_INTEGRATION_TYPES = [
    IntegrationType.Shopify,
    IntegrationType.BigCommerce,
    IntegrationType.Magento2,
]

const useStoreIntegrations = (types?: IntegrationType[]) => {
    const { hasAccess } = useAiAgentAccess()

    const getStoreIntegrations = useMemo(
        () =>
            getIntegrationsByTypes(
                types
                    ? types
                    : hasAccess
                      ? STORE_INTEGRATION_TYPES
                      : [IntegrationType.Shopify],
            ),
        [types, hasAccess],
    )

    return useAppSelector(getStoreIntegrations) as StoreIntegration[]
}

export { useStoreIntegrations }
