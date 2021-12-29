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
import facebookAdsReducer from './facebookAds/reducers'
import helpCenterReducer from './helpCenter/reducer'
import HTTPIntegrationEventsReducer from './HTTPIntegrationEvents/reducers'
import infobarActionsReducer from './infobarActions/reducers'
import infobarReducer from './infobar/reducers'
import integrationsReducer from './integrations/reducers'
import layoutReducer from './layout/reducers'
import macrosReducer from './macro/reducer'
import newMessageReducer from './newMessage/reducers'
import schemasReducer from './schemas/reducers'
import statsReducer from './stats/reducers'
import tagsReducer from './tags/reducers'
import teamReducer from './teams/reducers'
import ticketReducer from './ticket/reducers'
import ticketsReducer from './tickets/reducers'
import twilioReducer from './twilio/reducers'
import ui from './ui/reducers'
import usersAuditReducer from './usersAudit/reducers'
import viewsReducer from './views/reducers'
import widgetsReducer from './widgets/reducers'
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
    helpCenter: helpCenterReducer,
    HTTPIntegrationEvents: HTTPIntegrationEventsReducer,
    infobar: infobarReducer,
    infobarActions: infobarActionsReducer,
    integrations: integrationsReducer,
    layout: layoutReducer,
    macros: macrosReducer,
    newMessage: newMessageReducer,
    // @ts-ignore
    notifications: notificationsReducer(),
    schemas: schemasReducer,
    stats: statsReducer,
    tags: tagsReducer,
    teams: teamReducer,
    ticket: ticketReducer,
    tickets: ticketsReducer,
    twilio: twilioReducer,
    ui,
    usersAudit: usersAuditReducer,
    views: viewsReducer,
    widgets: widgetsReducer,
})

export default rootReducer
