import { combineReducers } from 'redux'
import { rules, error } from './rule'

const RootReducer = combineReducers({
    rules,
    error,
})

export default RootReducer
