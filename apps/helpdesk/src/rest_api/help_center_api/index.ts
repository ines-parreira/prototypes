import memoize from 'memoize-one'

import { getAccessToken, getBearerAuthorizationHeader } from 'rest_api/auth'

import { AbilityRules, AppAbility, createAbility } from './ability'
import { helpCenterAPI } from './client'
import { Client } from './client.generated'

function createAgentAbility(token: string | null) {
    if (!token) return undefined
    // update the ability of the user based on the rules defined in the JWT token
    const rawPayload: string | undefined = token.split('.')[1]
    if (!rawPayload) {
        return undefined
    }
    const parsedToken: { rules?: AbilityRules } = JSON.parse(
        window.atob(rawPayload),
    )
    if (parsedToken?.rules && Array.isArray(parsedToken.rules)) {
        return createAbility(parsedToken.rules)
    }

    return undefined
}

let client: Client | undefined
let agentAbility: AppAbility | undefined

export async function buildHelpCenterClient(): Promise<{
    client: Client
    agentAbility: AppAbility | undefined
}> {
    if (client) {
        return { client, agentAbility }
    }

    client = await helpCenterAPI.init<Client>()

    agentAbility = createAgentAbility(await getAccessToken())

    client.interceptors.request.use(async (config) => {
        // Prevent recursion while doing auth calls
        if (config.url === '/api/help-center/auth') {
            return config
        }

        const accessToken = await getAccessToken()
        const bearerToken = getBearerAuthorizationHeader(accessToken || '')

        config.headers.setAuthorization(bearerToken)
        return config
    })
    return { client, agentAbility }
}

export const getHelpCenterClient = memoize(buildHelpCenterClient)
