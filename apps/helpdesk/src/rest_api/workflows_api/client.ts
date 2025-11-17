import { isProduction, isStaging } from '@repo/utils'
import memoize from 'memoize-one'
import type { Document } from 'openapi-client-axios'
import OpenAPIClientAxios from 'openapi-client-axios'

import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'

import type { Client } from './client.generated'
import OpenAPIDoc from './wf-api.openapi.json'

function getWfApiBaseURL(): string {
    if (isProduction()) {
        return 'https://api.gorgias.work'
    }

    if (isStaging()) {
        return 'https://api-staging.gorgias.work'
    }

    return 'http://localhost:3100'
}

let apiClient: Client

async function buildGorgiasWfApiClient() {
    if (apiClient) {
        return apiClient
    }

    const api = new OpenAPIClientAxios({
        definition: OpenAPIDoc as unknown as Document,
        withServer: { url: getWfApiBaseURL() },
    })
    apiClient = await api.init<Client>()
    apiClient.interceptors.request.use(gorgiasAppsAuthInterceptor)

    return apiClient
}

export const getGorgiasWfApiClient = memoize(buildGorgiasWfApiClient)
