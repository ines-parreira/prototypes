import {combineReducers} from 'redux'
import {routerReducer as routing} from 'react-router-redux'

import {systemMessage} from './systemMessage'
import {currentUser} from './currentUser'
import {rules} from './rule'
import {schemas} from './schema'
import {tickets} from './tickets'
import {ticket} from './ticket'
import {widgets} from './widgets'
import {users} from './users'
import {settings} from './settings'
import {tags} from './tags'
import {macros} from './macros'
import {integrationSettings} from './integrationSettings'
import {views} from './view'
import {activity} from './activity'

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
