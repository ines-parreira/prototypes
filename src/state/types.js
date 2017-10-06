import type {Map} from 'immutable'

export type stateType = {
    activity: {},
    agents: {},
    billing: {},
    currentAccount: {},
    currentUser: {},
    infobar: {},
    integrations: {},
    layout: {},
    macros: {},
    newMessage: {},
    notifications: {},
    rules: {},
    schemas: {},
    settings: {},
    stats: {},
    tags: {},
    ticket: {},
    tickets: {},
    users: {},
    views: {},
    widgets: {},
}

export type currentUserType = Map<*,*>
export type getStateType = () => stateType

// redux
export type actionType = {
    type: string
}
export type dispatchType = (T: actionType) => void
export type thunkActionType = (dispatch: dispatchType, getState?: getStateType) => any

