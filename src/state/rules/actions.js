import axios from 'axios'
import {List} from 'immutable'

import * as types from './constants'
import {notify} from '../notifications/actions'

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

export const modifyCodeast = (id, path, value, operation) => (dispatch, getState) => (
    dispatch({
        type: types.RULES_UPDATE_CODE_AST,
        schemas: getState().schemas,
        id,
        path,
        value,
        operation,
    })
)

export const initialiseCodeAST = (id) => ({
    type: types.RULES_INITIALISE_CODE_AST,
    id,
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
export const create = (data) => (dispatch) => {
    return axios.post('/api/rules/', data)
        .then((response) => {
            dispatch(addRuleEnd(response.data))
        }, (error) => {
            dispatch(fail(error, 'Unable to create the rule'))
        })
}

/**
 * Save a rule
 * @param data
 */
export const save = (data) => {
    return dispatch => {
        return axios.put(`/api/rules/${data.id}/`, data)
            .then(() => {
                dispatch({
                    type: types.UPDATE_RULE_SUCCESS,
                    ruleId: data.id
                })
                dispatch(notify({
                    type: 'success',
                    message: 'Rule saved successfully',
                }))
            }, (error) => {
                dispatch({
                    type: types.UPDATE_RULE_ERROR,
                    ruleId: data.id
                })
                dispatch(fail(error, 'Unable to save the rule'))
            })
    }
}

/**
 * Activate a rule
 * @param id rule id
 */
export const activate = (id) => (dispatch) => (
    axios.put(`/api/rules/${id}/`, {deactivated_datetime: null})
        .then(() => {
            dispatch(({
                type: types.ACTIVATE_RULE,
                id,
            }))
            dispatch(notify({
                type: 'success',
                message: 'Rule activated successfully',
            }))
        }, error => {
            return dispatch(fail(error, 'Unable to activate the rule'))
        })
)


/**
 * Deactivate a rule
 * @param id
 */
export const deactivate = (id) => (dispatch) => (
    axios.put(`/api/rules/${id}/`, {deactivated_datetime: new Date()})
        .then(() => {
            dispatch(({
                type: types.DEACTIVATE_RULE,
                id,
            }))
            dispatch(notify({
                type: 'success',
                message: 'Rule deactivated successfully',
            }))
        }, error => {
            return dispatch(fail(error, 'Unable to deactivate the rule'))
        })
)

/**
 * Delete a rule
 * @param id
 */
export const remove = (id) => (dispatch) => (
    axios.delete(`/api/rules/${id}/`)
        .then(() => {
            dispatch(({
                type: types.REMOVE_RULE,
                id,
            }))
            dispatch(notify({
                type: 'success',
                message: 'Rule deleted successfully',
            }))
        }, error => {
            return dispatch(fail(error, 'Unable to delete the rule'))
        })
)

/**
 * Reset the code ast of a rule
 * @param id
 */
export const reset = (id) => (dispatch) => (
    axios.get(`/api/rules/${id}`)
        .then((json = {}) => json.data)
        .then(response => {
            dispatch({
                type: types.RESET_RULE_SUCCESS,
                ruleId: id
            })
            return dispatch(modifyCodeast(
                id,
                List([]),
                response.code_ast || types.DEFAULT_IF_STATEMENT,
                'UPDATE'
            ))
        })
)

// Submit rule
export function submitRule(url, comment) {
    return (dispatch) => {
        dispatch(addRuleStart(comment.type, comment.code)) // Not used

        return axios.post(url, comment)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch(addRuleEnd(resp))
            }, error => {
                return dispatch(fail(error, 'Unable to submit the rule'))
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
            }, error => {
                return dispatch(fail(error, 'Unable to receive rules'))
            })
    }
}
