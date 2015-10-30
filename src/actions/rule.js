import { combineReducers } from 'redux'

/* Action types. */

export const ADD_RULE = 'ADD_RULE'

/* Actions */

function addRule(title, code) {
    return {
        type: ADD_RULE,
        title,
        code
    }
}

export default addRule
