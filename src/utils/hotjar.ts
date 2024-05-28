import {User} from 'config/types/user'
import {Account} from 'state/currentAccount/types'

export type InitHotjarParams = {
    clientVersion: string
    serverVersion: string
    currentUser: User
    currentAccount: Account
}

export function identifyUser({
    clientVersion,
    serverVersion,
    currentAccount,
    currentUser,
}: InitHotjarParams) {
    window.hj?.('identify', currentUser.id.toString(), {
        email: currentUser.email,
        domain: currentAccount.domain,
        clientVersion,
        serverVersion,
    })
}
