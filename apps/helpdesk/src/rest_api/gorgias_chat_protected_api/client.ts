import { isProduction, isStaging } from '@repo/utils'
import memoize from 'memoize-one'
import OpenAPIClientAxios, { Document } from 'openapi-client-axios'

import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'

import { Client } from './client.generated'
import OpenAPIDoc from './gorgias-chat-protected-api.openapi.json'

function getGorgiasChatApiBaseUrl(): string {
    if (isProduction()) {
        return 'https://us-east1-898b.gorgias.chat'
    }

    if (isStaging()) {
        // Check if override is set for preview environments
        if (window.GORGIAS_CHAT_CLUSTER_URL !== '') {
            return window.GORGIAS_CHAT_CLUSTER_URL
        }
        return 'https://us-east1-b39a.gorgias-staging.chat'
    }

    return 'http://acme.gorgias.docker:9001'
}

let apiClient: Client

async function buildGorgiasChatProtectedApiClient() {
    if (apiClient) {
        return apiClient
    }

    const api = new OpenAPIClientAxios({
        definition: OpenAPIDoc as Document,
        withServer: { url: getGorgiasChatApiBaseUrl() },
    })
    apiClient = await api.init<Client>()
    apiClient.interceptors.request.use(gorgiasAppsAuthInterceptor)

    return apiClient
}

export const getGorgiasChatProtectedApiClient = memoize(
    buildGorgiasChatProtectedApiClient,
)
