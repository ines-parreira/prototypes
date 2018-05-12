import type {Map} from 'immutable'

export type stateType = {
    activity: Map<*,*>,
    agents: Map<*,*>,
    billing: Map<*,*>,
    currentAccount: Map<*,*>,
    currentUser: Map<*,*>,
    infobar: Map<*,*>,
    integrations: Map<*,*>,
    layout: Map<*,*>,
    macros: Map<*,*>,
    requests: Map<*,*>,
    newMessage: Map<*,*>,
    notifications: Map<*,*>,
    rules: Map<*,*>,
    schemas: Map<*,*>,
    stats: Map<*,*>,
    tags: Map<*,*>,
    ticket: Map<*,*>,
    tickets: Map<*,*>,
    users: Map<*,*>,
    views: Map<*,*>,
    widgets: Map<*,*>,
}

export type currentUserType = Map<*,*>
export type currentAccountType = Map<*,*>
export type getStateType = () => stateType

// redux
export type actionType = {
    type: string
}
export type dispatchType = (T: actionType) => void
export type thunkActionType = (dispatch: dispatchType, getState?: getStateType) => any

