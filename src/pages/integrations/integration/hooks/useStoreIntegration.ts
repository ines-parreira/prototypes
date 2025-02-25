import { Map } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import { getStoreIntegrations } from 'state/integrations/selectors'

/**
 * @param integration - Integration instance.
 * @returns The store connected to the given integration, along with metadata about connection status.
 */
export const useStoreIntegration = (integration: Map<any, any>) => {
    const storeIntegrations = useAppSelector(getStoreIntegrations)

    const storeIntegrationId = integration.getIn([
        'meta',
        'shop_integration_id',
    ])
    const storeIntegration = storeIntegrations.find(
        (storeIntegration) => storeIntegration.id === storeIntegrationId,
    )

    return {
        storeIntegration,
        isConnected: !!storeIntegration,
        isConnectedToShopify:
            storeIntegration?.type === IntegrationType.Shopify,
    }
}
