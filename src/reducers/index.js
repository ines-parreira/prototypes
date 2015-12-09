import { combineReducers } from 'redux'
import { routerStateReducer as router } from 'redux-router'

import { systemMessage } from './systemMessage'
import { currentUser } from './currentUser'
import { rules } from './rule'
import { tickets, ticket } from './ticket'
import { views } from './view'

const rootReducer = combineReducers({
    systemMessage,
    currentUser,
    ticket,
    tickets,
    rules,
    views,
    router
})

export default rootReducer
