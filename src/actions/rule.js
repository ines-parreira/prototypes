import reqwest from 'reqwest'
import {systemMessage} from './systemMessage.js'

export const ADD_RULE_START = 'ADD_RULE_START'
export const ADD_RULE_END = 'ADD_RULE_END'

export const RULES_REQUESTS_POSTS = 'RULES_REQUESTS_POSTS'
export const RULES_RECEIVE_POSTS = 'RULES_RECEIVE_POSTS'

export const RULES_UPDATE_CODE_AST = 'RULES_UPDATE_CODE_AST'
export const RULES_ADD_ACTION_CODE_AST = 'RULES_ADD_ACTION_CODE_AST'


/* Actions */
export const addRuleStart = (type, code) => ({
    type: ADD_RULE_START,
    title: type,
    code
})

export const addRuleEnd = (rule) => ({
    type: ADD_RULE_END,
    rule
})

export const requestRules = (url) => ({
    type: RULES_REQUESTS_POSTS,
    url
})

export const receiveRules = (rules) => ({
    type: RULES_RECEIVE_POSTS,
    rules
})

export const modifyCodeast = (index, path, value, operation) => ({
    type: RULES_UPDATE_CODE_AST,
    index,
    path,
    value,
    operation
})

// Submit rule
export function submitRule(url, comment) {
    return (dispatch) => {
        dispatch(addRuleStart(comment.type, comment.code))

        return reqwest({
            url,
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
            url,
            type: 'json',
            method: 'GET',
            contentType: 'application/json'
        }).then((resp) => {
            dispatch(receiveRules(resp.data))
        })
    }
}
