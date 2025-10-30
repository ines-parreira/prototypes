import { createClient } from 'models/api/resources'
import { ApiPaginationParams } from 'models/api/types'
import { IntegrationDataItem } from 'models/integration/types/misc'
import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'

import {
    AdditionalInfoKey,
    AdditionalInfoObjectType,
    AdditionalInfoSourceType,
    LookupValue,
    Product,
    ProductAdditionalInfoPayload,
    ProductCollection,
} from './types'

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

export const fetchEcommerceLookupValues = async (
    type: 'product_tag' | 'vendor',
    integrationId: number,
    params: ApiPaginationParams & { value?: string } = {},
) =>
    await client.get<{
        data: LookupValue[]
        metadata: {
            next_cursor: string | null
            prev_cursor: string | null
        }
    }>(`/api/ecommerce/lookup_values/${type}/shopify/${integrationId}`, {
        params,
    })

export const fetchEcommerceProducts = async (
    integrationId: number,
    params: ApiPaginationParams = {},
) =>
    await client.get<{
        data: Product[]
        metadata: {
            next_cursor: string | null
            prev_cursor: string | null
        }
    }>(`/api/ecommerce/product/shopify`, {
        params: {
            integration_id: integrationId,
            ...params,
        },
    })

export const fetchEcommerceProductCollections = async (
    integrationId: number,
    params: ApiPaginationParams & {
        external_ids?: string[]
    } = {},
) =>
    await client.get<{
        data: ProductCollection[]
        metadata: {
            next_cursor: string | null
            prev_cursor: string | null
        }
    }>(`/api/ecommerce/product_collection/shopify`, {
        params: {
            ...params,
            integration_id: integrationId,
        },
        paramsSerializer: {
            indexes: null,
        },
    })

/**
 * Updates additional information for a product in the ecommerce API
 * @param objectType - The type of object
 * @param sourceType - The source type
 * @param integrationId - The integration ID
 * @param externalId - The external ID of the product
 * @param key - The key for the additional info
 * @param data - The additional information payload
 * @returns The updated additional information
 */
export const updateProductAdditionalInfo = async (
    objectType: AdditionalInfoObjectType,
    sourceType: AdditionalInfoSourceType,
    integrationId: number,
    externalId: string,
    key: AdditionalInfoKey,
    data: ProductAdditionalInfoPayload,
) =>
    await client.put<ProductAdditionalInfoPayload>(
        `/api/ecommerce/${objectType}/${sourceType}/${integrationId}/${externalId}/additional-info/${key}`,
        data,
    )
