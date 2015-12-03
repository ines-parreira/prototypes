import { combineReducers } from 'redux'
import { routerStateReducer as router } from 'redux-router'

import { rules } from './rule'
import { ticket, tickets } from './ticket'
import { views } from './view'
import { systemMessage } from './systemMessage'

const rootReducer = combineReducers({
    systemMessage,
    ticket,
    tickets,
    rules,
    views,
    router
})

export default rootReducer
