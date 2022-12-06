import OpenAPIClientAxios, {Document} from 'openapi-client-axios'
import memoize from 'memoize-one'
import {isProduction, isStaging} from 'utils/environment'

import OpenAPIDoc from './gorgias-chat-api.openapi.json'
import {Client} from './client.generated'

function getGorgiasChatApiBaseUrl(): string {
    /**
     * @todo: make it to work for preview environments
     */
    if (isProduction()) {
        return 'https://config.gorgias.chat'
    }

    if (isStaging()) {
        return 'https://config.gorgias-staging.chat'
    }

    return 'http://acme.gorgias.docker:9001'
}

let gorgiasApiClient: Client

async function buildGorgiasChatApiClient() {
    if (gorgiasApiClient) {
        return gorgiasApiClient
    }

    const api = new OpenAPIClientAxios({
        definition: OpenAPIDoc as Document,
        withServer: {url: getGorgiasChatApiBaseUrl()},
    })
    gorgiasApiClient = await api.init<Client>()

    return gorgiasApiClient
}

export const getGorgiasChatApiClient = memoize(buildGorgiasChatApiClient)
