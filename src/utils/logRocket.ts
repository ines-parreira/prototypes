import LogRocket from 'logrocket'

import {User} from 'config/types/user'
import {Account} from 'state/currentAccount/types'

export type InitLogRocketParams = {
    appId: string
    currentAccount: Account
    currentUser: User
    release: string
}

export function initLogRocket({
    appId,
    currentUser,
    currentAccount,
    release,
}: InitLogRocketParams) {
    LogRocket.init(appId, {
        release,
        dom: {
            inputSanitizer: true,
        },
    })
    LogRocket.identify(currentUser.id.toString(), {
        name: currentUser.name,
        email: currentUser.email,
        domain: currentAccount.domain,
    })
}
