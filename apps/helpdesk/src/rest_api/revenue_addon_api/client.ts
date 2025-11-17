import { isProduction, isStaging } from '@repo/utils'
import memoize from 'memoize-one'
import type { Document } from 'openapi-client-axios'
import OpenAPIClientAxios from 'openapi-client-axios'

import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'

import type { Client, Components } from './client.generated'
import OpenAPIDoc from './revenue-addon.openapi.json'

export function getGorgiasRevenueAddonApiBaseUrl(): string {
    if (isProduction()) {
        return 'https://gorgias-convert.com'
    }

    if (isStaging()) {
        return 'https://staging.gorgias-convert.com'
    }

    return 'http://acme.gorgias.docker:8095'
}

let apiClient: Client

async function buildGorgiasRevenueAddonApiClient() {
    if (apiClient) {
        return apiClient
    }

    const baseUrl = getGorgiasRevenueAddonApiBaseUrl()

    const api = new OpenAPIClientAxios({
        definition: OpenAPIDoc as Document,
        withServer: { url: baseUrl },
        axiosConfigDefaults: {
            paramsSerializer: {
                // Setting `indexes: null` disables bracket notation for array parameters,
                // ensuring compatibility with the convert API requirements.
                indexes: null,
            },
        },
    })
    apiClient = await api.init<Client>()
    apiClient.interceptors.request.use(gorgiasAppsAuthInterceptor)

    return apiClient
}

export const getRevenueAddonApiClient = memoize(
    buildGorgiasRevenueAddonApiClient,
)

export type RevenueAddonClient = Client

export type CartAbandonedJourneyConfigurationApiDTO =
    Components.Schemas.CartAbandonedJourneyConfigurationApiDTO
