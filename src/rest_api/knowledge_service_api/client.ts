import memoize from 'memoize-one'
import OpenAPIClientAxios, { Document } from 'openapi-client-axios'

import { isProduction, isStaging } from 'utils/environment'
import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'

import { Client } from './client.generated'
import OpenAPIDoc from './ks-api.openapi.json'

export function getKsApiBaseURL(): string {
    return isProduction()
        ? `https://knowledge-service.gorgias.help`
        : isStaging()
          ? 'https://knowledge-service.gorgias.rehab'
          : `http://localhost:9500`
}

let apiClient: Client

export async function buildGorgiasKsApiClient() {
    if (apiClient) {
        return apiClient
    }

    const api = new OpenAPIClientAxios({
        definition: OpenAPIDoc as unknown as Document,
        withServer: { url: getKsApiBaseURL() },
    })
    apiClient = await api.init<Client>()
    apiClient.interceptors.request.use(gorgiasAppsAuthInterceptor)

    return apiClient
}

export const getGorgiasKsApiClient = memoize(buildGorgiasKsApiClient)
