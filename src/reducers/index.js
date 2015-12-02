import { combineReducers } from 'redux'
import { routerStateReducer as router } from 'redux-router'
import { ERROR_MESSAGE } from '../actions/errors'

import { rules } from './rule'
import { ticket, tickets } from './ticket'
import { views } from './view'

export function error(state = '', action) {
    switch (action.type) {
        case ERROR_MESSAGE:
            return action.errormsg
        default:
            return state
    }
}

const rootReducer = combineReducers({
    ticket,
    tickets,
    rules,
    views,
    error,
    router
})

export default rootReducer
