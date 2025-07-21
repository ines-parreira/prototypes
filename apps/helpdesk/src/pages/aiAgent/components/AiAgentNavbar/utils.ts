import { StoreIntegration } from 'models/integration/types'
import { ShopType } from 'models/selfServiceConfiguration/types'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'

export type SectionKey = `${ShopType}:${string}`

export const getSectionKeyFromStoreIntegration = (
    integration: StoreIntegration,
): SectionKey => {
    return `${integration.type}:${getShopNameFromStoreIntegration(integration)}`
}
