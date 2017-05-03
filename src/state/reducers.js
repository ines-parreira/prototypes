import {combineReducers} from 'redux'
import {reducer as formReducer} from 'redux-form'
import {reducer as notificationsReducer} from 'react-notification-system-redux'

import activityReducer from './activity/reducers'
import agentsReducer from './agents/reducers'
import billingReducer from './billing/reducers'
import currentAccountReducer from './currentAccount/reducers'
import currentUserReducer from './currentUser/reducers'
import infobarReducer from './infobar/reducers'
import integrationsReducer from './integrations/reducers'
import macrosReducer from './macro/reducers'
import rulesReducer from './rules/reducers'
import schemasReducer from './schemas/reducers'
import settingsReducer from './settings/reducers'
import statsReducer from './stats/reducers'
import tagsReducer from './tags/reducers'
import ticketReducer from './ticket/reducers'
import ticketsReducer from './tickets/reducers'
import usersReducer from './users/reducers'
import viewsReducer from './views/reducers'
import widgetsReducer from './widgets/reducers'

const rootReducer = combineReducers({
    activity: activityReducer,
    agents: agentsReducer,
    billing: billingReducer,
    currentAccount: currentAccountReducer,
    currentUser: currentUserReducer,
    form: formReducer,
    infobar: infobarReducer,
    integrations: integrationsReducer,
    macros: macrosReducer,
    notifications: notificationsReducer,
    rules: rulesReducer,
    schemas: schemasReducer,
    settings: settingsReducer,
    stats: statsReducer,
    tags: tagsReducer,
    ticket: ticketReducer,
    tickets: ticketsReducer,
    users: usersReducer,
    views: viewsReducer,
    widgets: widgetsReducer,
})

export default rootReducer
