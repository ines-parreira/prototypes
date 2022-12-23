import OpenAPIClientAxios, {Document} from 'openapi-client-axios'
import memoize from 'memoize-one'
import {isProduction, isStaging} from 'utils/environment'

import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'
import {Client} from './client.generated'
import OpenAPIDoc from './gorgias-chat-protected-api.openapi.json'

function getGorgiasChatApiBaseUrl(): string {
    /**
     * @todo: make it to work for preview environments
     */
    if (isProduction()) {
        return 'https://us-east1-898b.gorgias.chat'
    }

    if (isStaging()) {
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
        withServer: {url: getGorgiasChatApiBaseUrl()},
    })
    apiClient = await api.init<Client>()
    apiClient.interceptors.request.use(gorgiasAppsAuthInterceptor)

    return apiClient
}

export const getGorgiasChatProtectedApiClient = memoize(
    buildGorgiasChatProtectedApiClient
)
