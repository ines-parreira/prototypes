import { ADD_RULE_START, ADD_RULE_END, RULES_REQUESTS_POSTS, RULES_RECEIVE_POSTS, ERROR_MESSAGE } from '../constants/rule/ActionTypes'
import Immutable from 'immutable'
import reqwest from 'reqwest'

const initialState = Immutable.List([])

export function rules(state = initialState, action) {
    switch (action.type) {
        case ADD_RULE_END:
            return state.push(action.rule)

        case RULES_REQUESTS_POSTS:
            return state

        case RULES_RECEIVE_POSTS:
            return Immutable.List(action.rules)

        default:
            return state
    }
}

export function error(state='', action){
    switch (action.type){
        case ERROR_MESSAGE:
            return action.errormsg
        default:
            return state
    }
}
