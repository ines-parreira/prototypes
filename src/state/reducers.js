import {combineReducers} from 'redux'
import {routerReducer as routing} from 'react-router-redux'

import {systemMessage} from './systemMessage/reducers'
import {currentUser} from './currentUser/reducers'
import {rules} from './rules/reducers'
import {schemas} from './schema/reducers'
import {tickets} from './tickets/reducers'
import {ticket} from './ticket/reducers'
import {widgets} from './widget/reducers'
import {users} from './users/reducers'
import {settings} from './settings/reducers'
import {tags} from './tags/reducers'
import {macros} from './macro/reducers'
import {integrationSettings} from './integration/reducers'
import {views} from './view/reducers'
import {activity} from './activity/reducers'

const rootReducer = combineReducers({
    systemMessage,
    currentUser,
    settings,
    tickets,
    ticket,
    widgets,
    schemas,
    rules,
    views,
    activity,
    users,
    tags,
    macros,
    integrationSettings,
    routing
})

export default rootReducer
