import { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'

export const hasAtLeastOneShopifyStore = (
    storeActivations: Record<string, StoreActivation>,
) => {
    return Object.values(storeActivations).filter(
        (storeActivation) =>
            storeActivation.configuration.shopType === 'shopify',
    )
}
