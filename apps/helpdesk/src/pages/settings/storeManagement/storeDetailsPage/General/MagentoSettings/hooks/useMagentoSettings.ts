import { Magento2Integration } from 'models/integration/types'

export const useMagentoSettings = (integration: Magento2Integration) => {
    const storeUrl = integration.meta.store_url
    const isManual = integration.meta.is_manual
    const isActive = !integration?.deactivated_datetime

    return {
        storeUrl,
        isManual,
        isActive,
    }
}
