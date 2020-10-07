import type {Map, List} from 'immutable'

import type {MacrosAction} from './entities/macros'
import type {InfobarActionsState} from './infobarActions/types'
import type {EntitiesState} from './entities/types'

export type stateType = {
    activity: Map<*, *>,
    agents: Map<*, *>,
    auths: List<any>,
    billing: Map<*, *>,
    currentAccount: Map<*, *>,
    currentUser: Map<*, *>,
    customers: Map<*, *>,
    entities: EntitiesState,
    facebookAds: Map<*, *>,
    HTTPIntegrationEvents: Map<any, any>,
    infobar: Map<*, *>,
    infobarActions: InfobarActionsState,
    integrations: Map<*, *>,
    layout: Map<*, *>,
    macros: Map<*, *>,
    newMessage: Map<*, *>,
    notifications: Map<*, *>,
    rules: Map<*, *>,
    schemas: Map<*, *>,
    stats: Map<*, *>,
    tags: Map<*, *>,
    ticket: Map<*, *>,
    tickets: Map<*, *>,
    usersAudit: Map<*, *>,
    views: Map<*, *>,
    widgets: Map<*, *>,
}
export type StoreAction = MacrosAction

export type currentUserType = Map<*, *>
export type currentAccountType = Map<*, *>
export type getStateType = () => stateType

// redux
export type actionType = {
    type: string,
}
export type Dispatch = (action: actionType) => void
export type thunkActionType = (
    dispatch: Dispatch,
    getState?: getStateType
) => any
