import { createClient } from 'models/api/resources'
import { IntegrationDataItem } from 'models/integration/types/misc'
import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'

const client = createClient()
client.interceptors.request.use(gorgiasAppsAuthInterceptor)

/**
 * Fetches an item from ecommerce API by external ID
 * @param objectType - The type of object to fetch (e.g., 'product', 'order', etc.)
 * @param sourceType - The source type (e.g., 'shopify')
 * @param integrationId - The integration ID
 * @param externalId - The external ID of the item
 * @returns The requested item details
 */
export const fetchEcommerceItemByExternalId = async <T>(
    objectType: string,
    sourceType: string,
    integrationId: number,
    externalId: string,
) =>
    await client.get<IntegrationDataItem<T>>(
        `/api/ecommerce/${objectType}/${sourceType}/${integrationId}/${externalId}`,
    )
