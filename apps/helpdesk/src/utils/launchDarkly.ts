import { isDevelopment } from '@repo/utils'
import * as LDClient from 'launchdarkly-js-client-sdk'

import type { User } from 'config/types/user'
import type { Account } from 'state/currentAccount/types'

let client: LDClient.LDClient
export let LDContext: LDClient.LDContext = {}

export function _setLDContext(context: LDClient.LDContext) {
    LDContext = context
}

export function getLDClient(): LDClient.LDClient {
    return client
}

export function initLaunchDarkly(
    user: User,
    account: Account,
    currentHelpdeskProductId?: string,
    currentAutomationProductId?: string,
): LDClient.LDClient {
    if (user && account) {
        const helpdeskMap = currentHelpdeskProductId
            ? { helpdeskPriceId: currentHelpdeskProductId }
            : ({} as Record<string, never>)

        const automationMap = currentAutomationProductId
            ? { automationPriceId: currentAutomationProductId }
            : ({} as Record<string, never>)

        const developerContext = {
            developer: {
                key: process.env.DEVELOPER_NAME ?? 'anonymous',
            },
        }

        const userContext = {
            kind: 'user',
            key: account.id.toString(),
            ...helpdeskMap,
            ...automationMap,
            userId: user.id.toString(),
            domain: account.domain,
            cluster: window.GORGIAS_CLUSTER,
            userImpersonated: window.USER_IMPERSONATED || false,
        }

        LDContext = {
            kind: 'multi',
            user: userContext,
            ...(isDevelopment() && developerContext),
        }
    }

    try {
        client = LDClient.initialize(
            window.GORGIAS_LAUNCHDARKLY_CLIENT_ID,
            LDContext,
            { bootstrap: 'localStorage' },
        )
    } catch (err) {
        console.error(err)
    }

    return client
}
