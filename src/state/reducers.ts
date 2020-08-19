import {combineReducers} from 'redux'
import {reducer as notificationsReducer} from 'reapop'

import agentsReducer from './agents/reducers'
import authsReducer from './auths/reducers'
import billingReducer from './billing/reducers'
import chatsReducer from './chats/reducers'
import currentAccountReducer from './currentAccount/reducers'
import currentUserReducer from './currentUser/reducers'
import customersReducer from './customers/reducers'
import entities from './entities/reducers'
import facebookAdsReducer from './facebookAds/reducers.js'
import HTTPIntegrationEventsReducer from './HTTPIntegrationEvents/reducers'
import infobarActionsReducer from './infobarActions/reducers'
import infobarReducer from './infobar/reducers'
import integrationsReducer from './integrations/reducers'
import layoutReducer from './layout/reducers'
import macrosReducer from './macro/reducer'
import newMessageReducer from './newMessage/reducers.js'
import rulesReducer from './rules/reducers.js'
import schemasReducer from './schemas/reducers.js'
import statsReducer from './stats/reducers.js'
import tagsReducer from './tags/reducers.js'
import teamReducer from './teams/reducers.js'
import ticketReducer from './ticket/reducers.js'
import ticketsReducer from './tickets/reducers.js'
import usersAuditReducer from './usersAudit/reducers.js'
import viewsReducer from './views/reducers.js'
import widgetsReducer from './widgets/reducers.js'
import {StoreState} from './types'

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
    HTTPIntegrationEvents: HTTPIntegrationEventsReducer,
    infobar: infobarReducer,
    infobarActions: infobarActionsReducer,
    integrations: integrationsReducer,
    layout: layoutReducer,
    macros: macrosReducer,
    newMessage: newMessageReducer,
    //eslint-disable-next-line @typescript-eslint/no-unsafe-call
    notifications: notificationsReducer(),
    rules: rulesReducer,
    schemas: schemasReducer,
    stats: statsReducer,
    tags: tagsReducer,
    teams: teamReducer,
    ticket: ticketReducer,
    tickets: ticketsReducer,
    usersAudit: usersAuditReducer,
    views: viewsReducer,
    widgets: widgetsReducer,
})

export default rootReducer
