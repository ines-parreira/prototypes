import { combineReducers } from 'redux'
import { routerStateReducer as router } from 'redux-router'

import { systemMessage } from './systemMessage'
import { currentUser } from './currentUser'
import { rules } from './rule'
import { schemas } from './schema'
import { tickets } from './tickets'
import { ticket } from './ticket'
import { users } from './users'
import { settings } from './settings'
import { tags } from './tags'
import { views } from './view'

const rootReducer = combineReducers({
    systemMessage,
    currentUser,
    settings,
    tickets,
    ticket,
    schemas,
    rules,
    views,
    users,
    tags,
    router
})

export default rootReducer
