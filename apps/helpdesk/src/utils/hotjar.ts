import type { User } from 'config/types/user'
import type { AutomatePlan } from 'models/billing/types'
import type { Account } from 'state/currentAccount/types'

export type InitHotjarParams = {
    clientVersion: string
    serverVersion: string
    currentUser: User
    currentAccount: Account
    automatePlan?: AutomatePlan | undefined
}

export function identifyUser({
    clientVersion,
    serverVersion,
    currentAccount,
    currentUser,
    automatePlan,
}: InitHotjarParams) {
    window.hj?.('identify', currentUser.id.toString(), {
        email: currentUser.email,
        domain: currentAccount.domain,
        account_status: currentAccount?.status?.status ?? undefined,
        automate_plan: automatePlan?.name ?? undefined,
        clientVersion,
        serverVersion,
    })
}
