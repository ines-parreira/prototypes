import memoize from 'memoize-one'
import OpenAPIClientAxios, {Document} from 'openapi-client-axios'

import {getAccessToken, getBearerAuthorizationHeader} from 'rest_api/utils'
import {isProduction, isStaging} from 'utils/environment'

import {Client} from './client.generated'
import OpenAPIDoc from './migration.openapi.json'

function getMigrationApiBaseUrl() {
    if (isStaging()) {
        return 'https://migration-staging.gorgias.com'
    }
    if (isProduction()) {
        return 'https://migration.gorgias.com'
    }

    return 'http://acme.gorgias.docker:8001'
}

export const migrationAPI = new OpenAPIClientAxios({
    definition: OpenAPIDoc as unknown as Document,
    withServer: {url: getMigrationApiBaseUrl()},
})

async function buildMigrationClient() {
    const client = await migrationAPI.getClient<Client>()

    client.interceptors.request.use(async (config) => {
        const accessToken = await getAccessToken()

        return {
            ...config,
            headers: {
                ...config.headers,
                authorization: getBearerAuthorizationHeader(accessToken || ''),
            },
        }
    })

    return client
}

export const getMigrationClient = memoize(buildMigrationClient)

export type MigrationClient = Client
