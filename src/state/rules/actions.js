import axios from 'axios'
import {fromJS, List} from 'immutable'

import * as types from './constants'
import {notify} from '../notifications/actions'

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

export const modifyCodeAST = (id, path, value, operation) => (dispatch, getState) => (
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
            return dispatch(addRuleEnd(response.data))
        }, (error) => {
            return dispatch(fail(error, 'Unable to create the rule'))
        })
}

/**
 * Save a rule
 * @param data
 */
export const save = (data) => {
    return dispatch => {
        return axios.put(`/api/rules/${data.id}/`, data)
            .then((json = {}) => json.data)
            .then((resp) => {
                dispatch(notify({
                    status: 'success',
                    message: 'Rule saved successfully',
                }))

                return dispatch({
                    type: types.UPDATE_RULE_SUCCESS,
                    ruleId: data.id,
                    rule: fromJS(resp),
                })
            }, (error) => {
                dispatch(fail(error, 'Unable to save the rule'))

                return dispatch({
                    type: types.UPDATE_RULE_ERROR,
                    ruleId: data.id
                })
            })
    }
}

/**
 * Activate a rule
 * @param id rule id
 */
export const activate = (id) => (dispatch) => (
    axios.put(`/api/rules/${id}/`, {deactivated_datetime: null})
        .then((json = {}) => json.data)
        .then(() => {
            dispatch(notify({
                status: 'success',
                message: 'Rule activated successfully',
            }))

            return dispatch(({
                type: types.ACTIVATE_RULE,
                id,
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
        .then((json = {}) => json.data)
        .then(() => {
            dispatch(notify({
                status: 'success',
                message: 'Rule deactivated successfully',
            }))

            return dispatch(({
                type: types.DEACTIVATE_RULE,
                id,
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
        .then((json = {}) => json.data)
        .then(() => {
            dispatch(notify({
                status: 'success',
                message: 'Rule deleted successfully',
            }))

            return dispatch(({
                type: types.REMOVE_RULE,
                id,
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
            return dispatch(modifyCodeAST(
                id,
                List([]),
                response.code_ast || types.DEFAULT_STATEMENT,
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
                return dispatch(addRuleEnd(resp))
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
                return dispatch(receiveRules(resp.data))
            }, error => {
                return dispatch(fail(error, 'Unable to receive rules'))
            })
    }
}
