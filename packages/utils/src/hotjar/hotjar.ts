export type HotjarUser = {
    id: number | string
    email: string
}

export type HotjarAccount = {
    domain: string
    status?: {
        status: string
    }
}

export type HotjarAutomatePlan = {
    name: string
}

export type InitHotjarParams = {
    clientVersion: string
    serverVersion: string
    currentUser: HotjarUser
    currentAccount: HotjarAccount
    automatePlan?: HotjarAutomatePlan | undefined
}

type HotjarIdentifyProperties = {
    email: string
    domain: string
    account_status: string | undefined
    automate_plan: string | undefined
    clientVersion: string
    serverVersion: string
}

type HotjarWindow = Window & {
    hj?: (
        method: 'identify',
        userId: string,
        properties: HotjarIdentifyProperties,
    ) => void
}

export function identifyUser({
    clientVersion,
    serverVersion,
    currentAccount,
    currentUser,
    automatePlan,
}: InitHotjarParams) {
    ;(window as HotjarWindow).hj?.('identify', currentUser.id.toString(), {
        email: currentUser.email,
        domain: currentAccount.domain,
        account_status: currentAccount.status?.status ?? undefined,
        automate_plan: automatePlan?.name ?? undefined,
        clientVersion,
        serverVersion,
    })
}
