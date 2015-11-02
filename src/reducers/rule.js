import { ADD_RULE, RULES_REQUESTS_POSTS, RULES_RECEIVE_POSTS } from '../actions/rule'
import Immutable from 'immutable'
import reqwest from 'reqwest'

const initialState = Immutable.List([])

function rules(state = initialState, action) {
    switch (action.type) {
        case ADD_RULE:
            return [
                ...state,
                {
                    title: action.title,
                    code: action.code
                }
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
