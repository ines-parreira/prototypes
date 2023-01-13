import OpenAPIClientAxios, {Document} from 'openapi-client-axios'
import memoize from 'memoize-one'
import {isProduction, isStaging} from 'utils/environment'

import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'
import {Client} from './client.generated'

import OpenAPIDoc from './click-tracking.openapi.json'

function getGorgiasClickTrackingApiBaseUrl(): string {
    if (isProduction()) {
        return 'https://link.gorgias.win'
    }

    if (isStaging()) {
        return 'https://staging-click-tracking.gorgias.win'
    }

    return 'http://acme.gorgias.docker:8095'
}

let apiClient: Client

async function buildGorgiasClickTrackingApiClient() {
    if (apiClient) {
        return apiClient
    }

    const baseUrl = getGorgiasClickTrackingApiBaseUrl()

    const api = new OpenAPIClientAxios({
        definition: OpenAPIDoc as Document,
        withServer: {url: baseUrl},
    })
    apiClient = await api.init<Client>()
    apiClient.interceptors.request.use(gorgiasAppsAuthInterceptor)

    return apiClient
}

export const getClickTrackingApiClient = memoize(
    buildGorgiasClickTrackingApiClient
)

export type ClickTrackingClient = Client
