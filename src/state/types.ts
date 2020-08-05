import {Map} from 'immutable'
import {Action} from 'redux'
import {ThunkDispatch} from 'redux-thunk'

import {MacrosAction} from './entities/macros/types'
import {EntitiesState} from './entities/reducers'
import {InfobarActionsState} from './infobarActions/types'
import rootReducer from './reducers'

export type StoreState = {
    activity: Map<any, any>
    agents: Map<any, any>
    billing: Map<any, any>
    currentAccount: Map<any, any>
    currentUser: Map<any, any>
    customers: Map<any, any>
    entities: EntitiesState
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

export type StoreDispatch = ThunkDispatch<StoreState, undefined, Action>

export type RootState = ReturnType<typeof rootReducer>
