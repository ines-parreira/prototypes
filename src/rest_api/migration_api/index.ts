import memoize from 'memoize-one'
import OpenAPIClientAxios, {Document} from 'openapi-client-axios'
import {AxiosHeaders} from 'axios'

import {getAccessToken, getBearerAuthorizationHeader} from 'rest_api/auth'
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

async function buildMigrationClient(): Promise<Client> {
    const client = await migrationAPI.getClient<Client>()

    client.interceptors.request.use(async (config) => {
        const accessToken = await getAccessToken()

        return {
            ...config,
            headers: {
                ...config.headers,
                authorization: getBearerAuthorizationHeader(accessToken || ''),
                /* TODO update type after this will be fixed
                 * https://github.com/axios/axios/issues/5573 */
            } as unknown as AxiosHeaders,
        }
    })

    return client
}

export const getMigrationClient = memoize(buildMigrationClient)

export type MigrationClient = Client
