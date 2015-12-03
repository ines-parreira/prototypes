import reqwest from 'reqwest'
import {systemMessage} from './systemMessage.js'

export const ADD_RULE_START = 'ADD_RULE_START'
export const ADD_RULE_END = 'ADD_RULE_END'

export const RULES_REQUESTS_POSTS = 'RULES_REQUESTS_POSTS'
export const RULES_RECEIVE_POSTS = 'RULES_RECEIVE_POSTS'

export const RULES_UPDATE_CODE_AST = 'RULES_UPDATE_CODE_AST'
export const RULES_ADD_ACTION_CODE_AST = 'RULES_ADD_ACTION_CODE_AST'


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

export function modifyCodeast(index, path, value, operation) {
    return {
        type: RULES_UPDATE_CODE_AST,
        index,
        path,
        value,
        operation,
    }
}

// Submit rule
export function submitRule(url, comment) {
    return (dispatch) => {
        dispatch(addRuleStart(comment.type, comment.code))

        return reqwest({
            url: url,
            type: 'json',
            method: 'POST',
            data: JSON.stringify(comment),
            contentType: 'application/json'
        }).then((resp) => {
            dispatch(addRuleEnd(resp))
        }).fail((resp) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Oops, Server error',
                msg: resp
            }))
        })
    }
}

export function fetchRules(url) {
    return (dispatch) => {
        dispatch(requestRules(url))

        return reqwest({
            url: url,
            type: 'json',
            method: 'GET',
            contentType: 'application/json'
        }).then((resp) => {
            dispatch(receiveRules(resp.data))
        })
    }
}
