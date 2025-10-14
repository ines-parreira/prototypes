import { useParams } from 'react-router'

import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'

type UseShopNameResolutionReturn = {
    /**
     * Shop name resolved from store integrations, more reliable than external sources
     */
    resolvedShopName: string
    /**
     * Current store integration that matches the provided shop name or the first one available
     */
    currentStoreIntegration: any
    /**
     * All available store integrations
     */
    storeIntegrations: any[]
}

/**
 * Hook that resolves shop names from store integrations data.
 *
 * This hook takes a shop name parameter and finds the corresponding store integration,
 * providing a consistent way to resolve shop names across components.
 *
 * @param shopName - The shop name to match against store integrations
 * @returns Resolved shop name and related store integration data
 */
export const useShopNameResolution = (): UseShopNameResolutionReturn => {
    const { shopName } = useParams<{ shopName?: string }>()
    // Get store integrations and determine shopName from them
    const storeIntegrations = useStoreIntegrations()

    // Find the current store integration based on provided shop name or default to first one
    const currentStoreIntegration =
        storeIntegrations.find(
            (integration) =>
                getShopNameFromStoreIntegration(integration) === shopName,
        ) || storeIntegrations[0]

    // Get shopName from the store integration (more reliable than external sources)
    const resolvedShopName = currentStoreIntegration
        ? getShopNameFromStoreIntegration(currentStoreIntegration)
        : shopName || ''

    return {
        resolvedShopName,
        currentStoreIntegration,
        storeIntegrations,
    }
}
