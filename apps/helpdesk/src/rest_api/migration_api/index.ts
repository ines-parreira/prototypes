import { isProduction, isStaging } from '@repo/utils'
import memoize from 'memoize-one'
import type { Document } from 'openapi-client-axios'
import OpenAPIClientAxios from 'openapi-client-axios'

import { getAccessToken, getBearerAuthorizationHeader } from 'rest_api/auth'

import type { Client } from './client.generated'
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
    withServer: { url: getMigrationApiBaseUrl() },
})

async function buildMigrationClient(): Promise<Client> {
    const client = await migrationAPI.getClient<Client>()

    client.interceptors.request.use(async (config) => {
        const accessToken = await getAccessToken()

        const bearerToken = getBearerAuthorizationHeader(accessToken || '')

        config.headers.setAuthorization(bearerToken)

        return config
    })

    return client
}

export const getMigrationClient = memoize(buildMigrationClient)

export type MigrationClient = Client
