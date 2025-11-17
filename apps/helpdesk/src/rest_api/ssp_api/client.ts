import { isProduction, isStaging } from '@repo/utils'
import memoize from 'memoize-one'
import type { Document } from 'openapi-client-axios'
import OpenAPIClientAxios from 'openapi-client-axios'

import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'

import type { Client } from './client.generated'
import OpenAPIDoc from './ssp-api.openapi.json'

function getGorgiasSSPBaseURL(): string {
    if (isProduction()) {
        return 'https://us-east1-898b.gorgias.chat/ssp'
    }

    if (isStaging()) {
        // Check if override is set for preview environments
        if (window.GORGIAS_SELF_SERVICE_PORTAL_URL !== '') {
            return window.GORGIAS_SELF_SERVICE_PORTAL_URL
        }
        return 'https://us-east1-b39a.gorgias-staging.chat/ssp'
    }

    return 'http://localhost:9003/ssp'
}

let apiClient: Client

async function buildGorgiasSSPApiClient() {
    if (apiClient) {
        return apiClient
    }

    const api = new OpenAPIClientAxios({
        definition: OpenAPIDoc as Document,
        withServer: { url: getGorgiasSSPBaseURL() },
    })
    apiClient = await api.init<Client>()
    apiClient.interceptors.request.use(gorgiasAppsAuthInterceptor as any)

    return apiClient
}

export const getGorgiasSSPApiClient = memoize(buildGorgiasSSPApiClient)
