import axios from 'axios'
import * as types from './constants'

/* Actions */
export const addRuleStart = (type, code) => ({
    type: types.ADD_RULE_START,
    title: type,
    code
})

export const addRuleEnd = (rule) => ({
    type: types.ADD_RULE_END,
    rule
})

export const requestRules = (url) => ({
    type: types.RULES_REQUESTS_POSTS,
    url
})

export const receiveRules = (rules) => ({
    type: types.RULES_RECEIVE_POSTS,
    rules
})

export const modifyCodeast = (index, path, value, operation) => ({
    type: types.RULES_UPDATE_CODE_AST,
    index,
    path,
    value,
    operation
})

// Submit rule
export function submitRule(url, comment) {
    return (dispatch) => {
        dispatch(addRuleStart(comment.type, comment.code))

        return axios.post(url, comment)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch(addRuleEnd(resp))
            })
            .catch(error => {
                dispatch({
                    type: 'ERROR',
                    error,
                    reason: 'Unable to submit the rule'
                })
            })
    }
}

export function fetchRules(url) {
    return (dispatch) => {
        dispatch(requestRules(url))

        return axios.get(url)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch(receiveRules(resp.data))
            })
            .catch(error => {
                dispatch({
                    type: 'ERROR',
                    error,
                    reason: 'Unable to receive rules'
                })
            })
    }
}
