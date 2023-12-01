import memoize from 'memoize-one'

import {getAccessToken, getBearerAuthorizationHeader} from 'rest_api/auth'

import {Client} from './client.generated'
import {AppAbility, AbilityRules, createAbility} from './ability'
import {helpCenterAPI} from './client'

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
