import { ADD_RULE_END, RULES_REQUESTS_POSTS, RULES_RECEIVE_POSTS } from '../actions/rule'
import Immutable from 'immutable'
import reqwest from 'reqwest'

const initialState = Immutable.List([])

function rules(state = initialState, action) {
    switch (action.type) {
        case ADD_RULE_END:
            return [
                ...state,
                action.rule
            ]

        case RULES_REQUESTS_POSTS:
            return state

        case RULES_RECEIVE_POSTS:
            return action.rules

        default:
            return state
    }
}

export default rules
