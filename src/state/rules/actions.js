import axios from 'axios'
import { List } from 'immutable'

import * as types from './constants'
import { systemMessage } from '../systemMessage/actions'

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

export const initialiseCodeAST = (index) => ({
    type: types.RULES_INITIALISE_CODE_AST,
    index,
})

export const fail = (error, reason) => ({
    type: 'ERROR',
    error,
    reason,
})

/**
 * Create a rule
 * @param data
 */
export const create = (data) => {
    return dispatch => {
        return axios.post('/api/rules/', data)
            .then(response => dispatch(addRuleEnd(response.data)))
            .catch(error => dispatch(fail(error, 'Unable to create the rule')))
    }
}

/**
 * Save a rule
 * @param data
 */
export const save = (data) => {
    return dispatch => {
        return axios.post('/api/rules/', data)
            .then(() => dispatch(systemMessage({
                type: 'success',
                msg: 'Rule saved!',
            })))
            .catch(error => dispatch(fail(error, 'Unable to save the rule')))
    }
}

/**
 * Reset the code ast of a rule
 * @param index
 */
export const reset = (index) => {
    return (dispatch, getState) => {
        const { id } = getState().rules.get(index)
        return axios.get(`/api/rules/${id}`)
            .then((json = {}) => json.data)
            .then(response => dispatch(modifyCodeast(
                index,
                List([]),
                response.code_ast,
                'UPDATE'
            )))
    }
}

// Submit rule
export function submitRule(url, comment) {
    return (dispatch) => {
        dispatch(addRuleStart(comment.type, comment.code)) // Not used

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

export function fetchRules() {
    const url = '/api/rules/'
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
