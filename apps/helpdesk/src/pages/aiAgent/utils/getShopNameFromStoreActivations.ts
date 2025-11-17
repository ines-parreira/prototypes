import type { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { isStoreEligibleForTrial } from 'pages/aiAgent/utils/aiSalesAgentTrialUtils'

export const getShopNameFromStoreActivations = (
    storeActivations: Record<string, StoreActivation>,
): string => {
    const storeKeys = Object.keys(storeActivations)

    if (!storeKeys.length) {
        return ''
    }

    // get first eligible store if exists
    const eligibleStore = Object.values(storeActivations).find(
        isStoreEligibleForTrial,
    )
    if (eligibleStore) {
        return eligibleStore.configuration.storeName
    }

    return storeKeys[0]
}
