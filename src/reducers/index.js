import { combineReducers } from 'redux'
import {ERROR_MESSAGE} from '../constants/utils'

import { rules } from './rule'
import { tickets } from './ticket'

export function error(state = '', action) {
    switch (action.type) {
        case ERROR_MESSAGE:
            return action.errormsg
        default:
            return state
    }
}

const RootReducer = combineReducers({
    tickets,
    rules,
    error
})

export default RootReducer
