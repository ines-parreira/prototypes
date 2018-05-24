import {combineReducers} from 'redux'
import {reducer as notificationsReducer} from 'reapop'

import chatsReducer from './chats/reducers'
import agentsReducer from './agents/reducers'
import billingReducer from './billing/reducers'
import currentAccountReducer from './currentAccount/reducers'
import currentUserReducer from './currentUser/reducers'
import HTTPIntegrationEventsReducer from './HTTPIntegrationEvents/reducers'
import infobarReducer from './infobar/reducers'
import integrationsReducer from './integrations/reducers'
import layoutReducer from './layout/reducers'
import macrosReducer from './macro/reducers'
import requestsReducer from './requests/reducers'
import newMessageReducer from './newMessage/reducers'
import rulesReducer from './rules/reducers'
import schemasReducer from './schemas/reducers'
import statsReducer from './stats/reducers'
import tagsReducer from './tags/reducers'
import ticketReducer from './ticket/reducers'
import ticketsReducer from './tickets/reducers'
import usersReducer from './users/reducers'
import usersAuditReducer from './usersAudit/reducers'
import viewsReducer from './views/reducers'
import widgetsReducer from './widgets/reducers'

const rootReducer = combineReducers({
    chats: chatsReducer,
    agents: agentsReducer,
    billing: billingReducer,
    currentAccount: currentAccountReducer,
    currentUser: currentUserReducer,
    infobar: infobarReducer,
    integrations: integrationsReducer,
    HTTPIntegrationEvents: HTTPIntegrationEventsReducer,
    layout: layoutReducer,
    macros: macrosReducer,
    requests: requestsReducer,
    newMessage: newMessageReducer,
    notifications: notificationsReducer(),
    rules: rulesReducer,
    schemas: schemasReducer,
    stats: statsReducer,
    tags: tagsReducer,
    ticket: ticketReducer,
    tickets: ticketsReducer,
    users: usersReducer,
    usersAudit: usersAuditReducer,
    views: viewsReducer,
    widgets: widgetsReducer,
})

export default rootReducer
