import * as LDClient from 'launchdarkly-js-client-sdk'

import {User} from 'config/types/user'
import {Account} from 'state/currentAccount/types'

let client: LDClient.LDClient

export function getLDClient(): LDClient.LDClient {
    return client
}

export function initLaunchDarkly(
    user: User,
    account: Account
): LDClient.LDClient {
    let LDUser: LDClient.LDUser = {}

    if (user && account) {
        LDUser = {
            key: user.id.toString(),
            firstName: user.firstname,
            lastName: user.lastname,
            email: user.email,
            country: user.country ?? undefined,
            custom: {
                roles: user.roles.map((role) => role.name),
                plan: account.current_subscription.plan,
                domain: account.domain,
            },
        }
    }

    client = LDClient.initialize(window.GORGIAS_LAUNCHDARKLY_CLIENT_ID, LDUser)

    return client
}
