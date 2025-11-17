import type { Integration, StoreIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import type { StoreMapping } from 'models/storeMapping/types'

import type { StoreWithAssignedChannels } from '../types'
import groupIntegrationsByStore from './groupIntegrationsByStore'

export default function enrichStores(
    storeToChannelsMapping: StoreMapping[],
    allIntegrations: Integration[],
): StoreWithAssignedChannels[] {
    const integrationMap = new Map(
        allIntegrations.map((integration) => [integration.id, integration]),
    )

    const allStores = allIntegrations.filter((integration) =>
        [
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ].includes(integration.type),
    ) as unknown as StoreIntegration[]

    const storeRecords = groupIntegrationsByStore(storeToChannelsMapping)

    return allStores.map((store) => {
        const storeWithMap = storeRecords.find(
            (map) => map.store_id === store.id,
        )

        const assignedChannels = (storeWithMap?.integrations || [])
            .map((integrationId) => integrationMap.get(integrationId))
            .filter(
                (integration): integration is Integration =>
                    integration !== undefined,
            )

        return {
            store,
            assignedChannels,
        }
    })
}
