import {combineReducers} from 'redux'
import {routerReducer} from 'react-router-redux'
import {reducer as formReducer} from 'redux-form'

import systemMessageReducer from './systemMessage/reducers'
import currentUserReducer from './currentUser/reducers'
import rulesReducer from './rules/reducers'
import schemasReducer from './schema/reducers'
import ticketsReducer from './tickets/reducers'
import ticketReducer from './ticket/reducers'
import widgetsReducer from './widgets/reducers'
import usersReducer from './users/reducers'
import settingsReducer from './settings/reducers'
import tagsReducer from './tags/reducers'
import macrosReducer from './macro/reducers'
import integrationsReducer from './integrations/reducers'
import viewsReducer from './views/reducers'
import activityReducer from './activity/reducers'
import statsReducer from './stats/reducers'
import infobarReducer from './infobar/reducers'

const rootReducer = combineReducers({
    systemMessage: systemMessageReducer,
    currentUser: currentUserReducer,
    settings: settingsReducer,
    tickets: ticketsReducer,
    ticket: ticketReducer,
    widgets: widgetsReducer,
    schemas: schemasReducer,
    rules: rulesReducer,
    views: viewsReducer,
    activity: activityReducer,
    users: usersReducer,
    tags: tagsReducer,
    macros: macrosReducer,
    integrations: integrationsReducer,
    stats: statsReducer,
    infobar: infobarReducer,
    routing: routerReducer,
    form: formReducer
})

export default rootReducer
