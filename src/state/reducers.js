import {combineReducers} from 'redux'
import {reducer as notificationsReducer} from 'reapop'

import agentsReducer from './agents/reducers'
import authsReducer from './auths/reducers'
import billingReducer from './billing/reducers'
import chatsReducer from './chats/reducers'
import currentAccountReducer from './currentAccount/reducers'
import currentUserReducer from './currentUser/reducers'
import customersReducer from './customers/reducers'
import facebookAdsReducer from './facebookAds/reducers'
import HTTPIntegrationEventsReducer from './HTTPIntegrationEvents/reducers'
import infobarReducer from './infobar/reducers'
import integrationsReducer from './integrations/reducers'
import layoutReducer from './layout/reducers'
import macrosReducer from './macro/reducer'
import newMessageReducer from './newMessage/reducers'
import rulesReducer from './rules/reducers'
import schemasReducer from './schemas/reducers'
import statsReducer from './stats/reducers'
import tagsReducer from './tags/reducers'
import ticketReducer from './ticket/reducers'
import ticketsReducer from './tickets/reducers'
import usersAuditReducer from './usersAudit/reducers'
import viewsReducer from './views/reducers'
import widgetsReducer from './widgets/reducers'

const rootReducer = combineReducers({
    agents: agentsReducer,
    auths: authsReducer,
    billing: billingReducer,
    chats: chatsReducer,
    currentAccount: currentAccountReducer,
    currentUser: currentUserReducer,
    customers: customersReducer,
    facebookAds: facebookAdsReducer,
    HTTPIntegrationEvents: HTTPIntegrationEventsReducer,
    infobar: infobarReducer,
    integrations: integrationsReducer,
    layout: layoutReducer,
    macros: macrosReducer,
    newMessage: newMessageReducer,
    notifications: notificationsReducer(),
    rules: rulesReducer,
    schemas: schemasReducer,
    stats: statsReducer,
    tags: tagsReducer,
    ticket: ticketReducer,
    tickets: ticketsReducer,
    usersAudit: usersAuditReducer,
    views: viewsReducer,
    widgets: widgetsReducer,
})

export default rootReducer
