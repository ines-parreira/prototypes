import OpenAPIClientAxios, {Document} from 'openapi-client-axios'
import memoize from 'memoize-one'
import {isProduction, isStaging} from 'utils/environment'

import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'
import {Client} from './client.generated'
import OpenAPIDoc from './ssp-api.openapi.json'

function getGorgiasSSPBaseURL(): string {
    if (isProduction()) {
        return 'https://us-east1-898b.gorgias.chat/ssp'
    }

    if (isStaging()) {
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
        withServer: {url: getGorgiasSSPBaseURL()},
    })
    apiClient = await api.init<Client>()
    apiClient.interceptors.request.use(gorgiasAppsAuthInterceptor as any)

    return apiClient
}

export const getGorgiasSSPApiClient = memoize(buildGorgiasSSPApiClient)
