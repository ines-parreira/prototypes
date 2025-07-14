import { reducer as notificationsReducer } from 'reapop'
import { combineReducers } from 'redux'

import { statsSlice } from 'domains/reporting/state/stats/statsSlice'

import agentsReducer from './agents/reducers'
import authsReducer from './auths/reducers'
import billingReducer from './billing/reducers'
import chatsReducer from './chats/reducers'
import currentAccountReducer from './currentAccount/reducers'
import currentUserReducer from './currentUser/reducers'
import customersReducer from './customers/reducers'
import entities from './entities/reducers'
import facebookAdsReducer from './facebookAds/reducers'
import infobarReducer from './infobar/reducers'
import infobarActionsReducer from './infobarActions/reducers'
import integrationsReducer from './integrations/reducers'
import layoutReducer from './layout/reducers'
import macrosReducer from './macro/reducer'
import newMessageReducer from './newMessage/reducers'
import queriesReducer from './queries/reducers'
import schemasReducer from './schemas/reducers'
import tagsReducer from './tags/reducers'
import teamReducer from './teams/reducers'
import ticketReducer from './ticket/reducers'
import ticketsReducer from './tickets/reducers'
import { StoreState } from './types'
import ui from './ui/reducers'
import viewsReducer from './views/reducers'
import widgetsReducer from './widgets/reducers'

const rootReducer = combineReducers<StoreState>({
    agents: agentsReducer,
    auths: authsReducer,
    billing: billingReducer,
    chats: chatsReducer,
    currentAccount: currentAccountReducer,
    currentUser: currentUserReducer,
    customers: customersReducer,
    entities,
    facebookAds: facebookAdsReducer,
    infobar: infobarReducer,
    infobarActions: infobarActionsReducer,
    integrations: integrationsReducer,
    layout: layoutReducer,
    macros: macrosReducer,
    newMessage: newMessageReducer,
    // @ts-ignore
    notifications: notificationsReducer(),
    schemas: schemasReducer,
    [statsSlice.name]: statsSlice.reducer,
    tags: tagsReducer,
    teams: teamReducer,
    ticket: ticketReducer,
    tickets: ticketsReducer,
    ui,
    views: viewsReducer,
    widgets: widgetsReducer,
    queries: queriesReducer,
})

export default rootReducer
