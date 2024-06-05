import {useQuery} from '@tanstack/react-query'

import {reportError} from 'utils/errors'

import {INTEGRATION_DATA_ITEM_TYPE_PRODUCT} from 'constants/integration'

import {
    getApplications,
    getInstallationSnippet,
} from 'state/integrations/actions/gorgias-chat.actions'

import GorgiasApi from 'services/gorgiasApi'

import {Product} from 'constants/integrations/types/shopify'

import {
    GetInstallationSnippetParams,
    IntegrationDataItem,
    ShopifyTags,
} from './types'
import {fetchShopTags, fetchCustomerSegments} from './resources/shopify'

export const getInstallationSnippetQueryKey = (
    params: GetInstallationSnippetParams
) => ['integration', 'gorgias-chat', 'getInstallationSnippet', params]

export const useGetInstallationSnippet = (
    params: GetInstallationSnippetParams,
    overrides?: {enabled: boolean}
) =>
    useQuery({
        queryKey: getInstallationSnippetQueryKey(params),
        queryFn: () => getInstallationSnippet(params),
        onError: () => {
            reportError(
                new Error('Failed to fetch chat installation snippet'),
                {
                    extra: params,
                }
            )
        },
        ...overrides,
    })

export const useApplications = () =>
    useQuery({
        queryKey: ['integration', 'gorgias-chat', 'getApplications'],
        queryFn: getApplications,
        onError: () => {
            reportError(new Error('Failed to fetch chat applications'))
        },
    })

export const useProductsFromShopifyIntegration = (
    integrationId: number,
    filter = ''
) => {
    return useQuery({
        queryKey: ['integration', 'shopify', integrationId, 'products', filter],
        queryFn: async () => {
            const gorgiasApi = new GorgiasApi()
            const results = await gorgiasApi.search(
                `/api/integrations/${integrationId}/${INTEGRATION_DATA_ITEM_TYPE_PRODUCT}/`,
                filter ?? ''
            )
            return results as IntegrationDataItem<Product>[]
        },
        keepPreviousData: true,
        onError: () => {
            reportError(
                new Error(
                    `Failed to fetch products for Shopify integration ${integrationId}`
                )
            )
        },
    })
}

export const useShopifyTags = (
    integrationId: number,
    tagsType: ShopifyTags
) => {
    return useQuery({
        queryKey: ['integration', 'shopify', integrationId, 'tags', tagsType],
        queryFn: async () => {
            const response = await fetchShopTags(integrationId, tagsType)
            return response
        },
        onError: () => {
            reportError(
                new Error(
                    `Failed to fetch ${tagsType} tags for Shopify integration ${integrationId}`
                )
            )
        },
    })
}

export const useListShopifyCustomerSegments = (
    integrationId: number,
    overrides?: {enabled: boolean}
) => {
    return useQuery({
        queryKey: [
            'integration',
            'shopify',
            integrationId,
            'customer',
            'segments',
        ],
        queryFn: async () => {
            const response = await fetchCustomerSegments(integrationId)
            return response
        },
        onError: () => {
            reportError(
                new Error(
                    `Failed to fetch customer segments for Shopify integration ${integrationId}`
                )
            )
        },
        ...overrides,
    })
}
