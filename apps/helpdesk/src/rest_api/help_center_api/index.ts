import axios from 'axios'
import memoize from 'memoize-one'

import { GorgiasAppAuthService } from 'utils/gorgiasAppsAuth'

import { AbilityRules, AppAbility, createAbility } from './ability'
import { helpCenterAPI } from './client'
import { Client } from './client.generated'
import { getHelpCenterApiBaseUrl } from './utils'

async function fetchAgentAbility(
    authService: GorgiasAppAuthService,
): Promise<AppAbility | undefined> {
    try {
        const accessToken = await authService.getAccessToken()
        const baseUrl = getHelpCenterApiBaseUrl()
        const { data } = await axios.get<{ rules: AbilityRules }>(
            `${baseUrl}/api/help-center/auth/abilities`,
            {
                headers: { Authorization: accessToken },
            },
        )

        if (data?.rules && Array.isArray(data.rules)) {
            return createAbility(data.rules)
        }
    } catch {
        // Fall back to undefined ability if the endpoint is unavailable
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

    const authService = new GorgiasAppAuthService()

    client = await helpCenterAPI.init<Client>()

    client.interceptors.request.use(async (config) => {
        const accessToken = await authService.getAccessToken()
        config.headers.setAuthorization(accessToken)
        return config
    })

    agentAbility = await fetchAgentAbility(authService)

    return { client, agentAbility }
}

export const getHelpCenterClient = memoize(buildHelpCenterClient)
