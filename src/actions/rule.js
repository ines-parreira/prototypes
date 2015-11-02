import { combineReducers } from 'redux'
import reqwest from 'reqwest'

/* Action types. */

export const ADD_RULE = 'ADD_RULE'
export const RULES_REQUESTS_POSTS = 'RULES_REQUESTS_POSTS'
export const RULES_RECEIVE_POSTS = 'RULES_RECEIVE_POSTS'

/* Actions */
export function addRule(title, code) {
    return {
        type: ADD_RULE,
        title,
        code
    }
}

export function requestRules(url) {
    return {
        type: RULES_REQUESTS_POSTS,
        url
    }
}

export function receiveRules(rules) {
    return {
        type: RULES_RECEIVE_POSTS,
        rules: rules
    }
}

export function fetchRules(url) {

    return function (dispatch) {
        dispatch(requestRules(url))

        return reqwest({
            url: url,
            type: 'json',
            method: 'GET',
            contentType: "application/json"
        }).then(function (resp) {
            dispatch(receiveRules(resp['data']))
        })
    }
}
