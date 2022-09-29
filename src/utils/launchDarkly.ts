import * as LDClient from 'launchdarkly-js-client-sdk'

import {User} from 'config/types/user'
import {Account} from 'state/currentAccount/types'

let client: LDClient.LDClient
export let LDUser: LDClient.LDUser = {}

export function getLDClient(): LDClient.LDClient {
    return client
}

export function initLaunchDarkly(
    user: User,
    account: Account
): LDClient.LDClient {
    if (user && account) {
        LDUser = {
            key: account.id.toString(),
            custom: {
                plan: account?.current_subscription?.plan,
                domain: account.domain,
                cluster: window.GORGIAS_CLUSTER,
            },
        }
    }

    try {
        client = LDClient.initialize(
            window.GORGIAS_LAUNCHDARKLY_CLIENT_ID,
            LDUser
        )
    } catch (err) {
        console.error(err)
    }

    return client
}
