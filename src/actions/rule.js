import { combineReducers } from 'redux'
import reqwest from 'reqwest'
import { ADD_RULE_START, ADD_RULE_END, RULES_REQUESTS_POSTS, RULES_RECEIVE_POSTS, ERROR_MESSAGE } from '../constants/rule/ActionTypes'


/* Actions */
export function addRuleStart(type, code) {
    return {
        type: ADD_RULE_START,
        title: type,
        code
    }
}

export function addRuleEnd(rule) {
    return {
        type: ADD_RULE_END,
        rule
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

export function errorMsg(errormsg) {
    return {
        type: ERROR_MESSAGE,
        errormsg
    }
}

export function submitRule(url, comment) {
    return function (dispatch) {
        dispatch(addRuleStart(comment.type, comment.code))

        return reqwest({
            url: url,
            type: 'json',
            method: 'POST',
            data: JSON.stringify(comment),
            contentType: "application/json"
        }).then(function (resp) {
            dispatch(addRuleEnd(resp))
        }).fail(function (resp) {
            dispatch(errorMsg('Ops, Server error.'))
        })
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
