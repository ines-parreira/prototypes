import OpenAPIClientAxios, {Document} from 'openapi-client-axios'
import memoize from 'memoize-one'

import {isProduction, isStaging} from 'utils/environment'
import {getAccessToken, getBearerAuthorizationHeader} from 'rest_api/utils'

import OpenAPIDoc from './help-center.openapi.json'
import {Client} from './client.generated'
import {AppAbility, AbilityRules, createAbility} from './ability'

export function getHelpCenterApiBaseUrl(): string {
    // Use helpdesk's host
    if (isStaging()) {
        return 'https://acme.gorgias.xyz'
    }
    if (isProduction()) {
        return 'https://internal-help-center-api.gorgias.com'
    }

    return 'http://acme.gorgias.docker:4001'
}

export const helpCenterAPI = new OpenAPIClientAxios({
    // We prefer having the OpenAPI doc locally rather
    // than fetching it at runtime.
    // Reason: the OpenAPI spec may change and it may mess the client
    // at runtime.
    definition: OpenAPIDoc as unknown as Document,
    ...(getHelpCenterApiBaseUrl()
        ? {withServer: {url: getHelpCenterApiBaseUrl()}}
        : {}),
})

let agentAbility: AppAbility | undefined

function createAgentAbility(token: string | null) {
    if (!token) return undefined
    // update the ability of the user based on the rules defined in the JWT token
    const rawPayload: string | undefined = token.split('.')[1]
    if (!rawPayload) {
        return undefined
    }
    const parsedToken: {rules?: AbilityRules} = JSON.parse(
        window.atob(rawPayload)
    )
    if (parsedToken?.rules && Array.isArray(parsedToken.rules)) {
        return createAbility(parsedToken.rules)
    }

    return undefined
}

async function buildHelpCenterClient(
    setAgentAbility?: (ability: AppAbility | undefined) => void
): Promise<Client> {
    const client = await helpCenterAPI.getClient<Client>()

    client.interceptors.request.use(async (config) => {
        // Prevent recursion while doing auth calls
        if (config.url === '/api/help-center/auth') {
            return config
        }

        const accessToken = await getAccessToken()

        setAgentAbility?.(createAgentAbility(accessToken))

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

export const getHelpCenterClient = memoize(buildHelpCenterClient)

export function getAgentAbility(): AppAbility | undefined {
    return agentAbility
}

export type HelpCenterClient = Client & {ability?: AppAbility}
