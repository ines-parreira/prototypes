import type {Map} from 'immutable'

import type {MacrosAction} from './entities/macros/types'
import type {InfobarActionsState} from './infobarActions/types'

export type StoreState = {
    activity: Map<any, any>
    agents: Map<any, any>
    billing: Map<any, any>
    currentAccount: Map<any, any>
    currentUser: Map<any, any>
    customers: Map<any, any>
    facebookAds: Map<any, any>
    infobar: Map<any, any>
    infobarActions: InfobarActionsState
    integrations: Map<any, any>
    layout: Map<any, any>
    macros: Map<any, any>
    newMessage: Map<any, any>
    notifications: Map<any, any>
    rules: Map<any, any>
    schemas: Map<any, any>
    stats: Map<any, any>
    tags: Map<any, any>
    ticket: Map<any, any>
    tickets: Map<any, any>
    usersAudit: Map<any, any>
    views: Map<any, any>
    widgets: Map<any, any>
}
export type StoreAction = MacrosAction

export type CurrentUser = Map<any, any>
export type CurrentAccount = Map<any, any>
