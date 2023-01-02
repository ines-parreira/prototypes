import OpenAPIClientAxios, {Document} from 'openapi-client-axios'
import memoize from 'memoize-one'
import {
    getHelpCenterAuthApiBaseUrl,
    isProduction,
    isStaging,
} from 'utils/environment'

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

const api = new OpenAPIClientAxios({
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

function isValidAccessToken(token: string | null): boolean {
    if (!token) {
        return false
    }

    const {exp} = JSON.parse(atob(token.split('.')[1]))
    const expirationDate = new Date(exp * 1000)
    return new Date() < expirationDate
}

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
    let accessToken: string | null
    let createAccessTokenPendingRequest: ReturnType<
        Client['createAccessToken']
    > | null = null

    const renewAccessToken = async (client: Client): Promise<void> => {
        // Prevent multiple /auth calls if parallel requests are made
        if (createAccessTokenPendingRequest) {
            await createAccessTokenPendingRequest
            return
        }

        createAccessTokenPendingRequest = client.createAccessToken(
            undefined,
            undefined,
            {
                baseURL: getHelpCenterAuthApiBaseUrl(),
                withCredentials: true,
            }
        )
        const {
            data: {access_token: tokenFromResponse},
        } = await createAccessTokenPendingRequest
        accessToken = tokenFromResponse
        createAccessTokenPendingRequest = null
    }

    const client = await api.getClient<Client>()

    client.interceptors.request.use(async (config) => {
        // Prevent recursion while doing auth calls
        if (config.url === '/api/help-center/auth') {
            return config
        }

        if (!isValidAccessToken(accessToken)) {
            await renewAccessToken(client)
        }

        setAgentAbility?.(createAgentAbility(accessToken))

        return {
            ...config,
            headers: {
                ...config.headers,
                authorization: `Bearer ${accessToken || ''}`,
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
