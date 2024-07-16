import OpenAPIClientAxios, {Document} from 'openapi-client-axios'
import memoize from 'memoize-one'
import {isProduction, isStaging} from 'utils/environment'

import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'
import {Client} from './client.generated'

import OpenAPIDoc from './revenue-addon.openapi.json'

function getGorgiasRevenueAddonApiBaseUrl(): string {
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
        withServer: {url: baseUrl},
    })
    apiClient = await api.init<Client>()
    apiClient.interceptors.request.use(gorgiasAppsAuthInterceptor)

    return apiClient
}

export const getRevenueAddonApiClient = memoize(
    buildGorgiasRevenueAddonApiClient
)

export type RevenueAddonClient = Client
