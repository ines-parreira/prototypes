import { combineReducers } from 'redux'
import { routerStateReducer as router } from 'redux-router'

import { systemMessage } from './systemMessage'
import { currentUser } from './currentUser'
import { rules } from './rule'
import { schemas } from './schema'
import { tickets } from './tickets'
import { ticket } from './ticket'
import { views } from './view'
import { users } from './users'

const rootReducer = combineReducers({
    systemMessage,
    currentUser,
    tickets,
    ticket,
    schemas,
    rules,
    views,
    users,
    router
})

export default rootReducer
