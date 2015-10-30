import { ADD_RULE } from '../actions/rule'

function addRule(state = [], action = {}) {
    switch (action.type) {
        case ADD_RULE:
            return [
                ...state,
                {
                    title: action.title,
                    code: action.code
                }
            ]
        default:
            return state
    }
}

export default addRule
