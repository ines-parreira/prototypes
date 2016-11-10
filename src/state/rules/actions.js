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
            .catch(error => {
                return dispatch(fail(error, 'Unable to create the rule'))
            })
    }
}

/**
 * Save a rule
 * @param data
 */
export const save = (data) => {
    return dispatch => {
        return axios.put(`/api/rules/${data.id}/`, data)
            .then(() => dispatch(notify({
                type: 'success',
                message: 'Rule saved successfully',
            })))
            .catch(error => {
                return dispatch(fail(error, 'Unable to save the rule'))
            })
    }
}

/**
 * Activate a rule
 * @param index
 */
export const activate = (index) => {
    return (dispatch, getState) => {
        const {id} = getState().rules.get(index)
        return axios.put(`/api/rules/${id}/`, {deactivated_datetime: null})
            .then(() => {
                dispatch(({
                    type: types.ACTIVATE_RULE,
                    index,
                }))
                dispatch(notify({
                    type: 'success',
                    message: 'Rule deactivated successfully',
                }))
            })
            .catch(error => {
                return dispatch(fail(error, 'Unable to deactivate the rule'))
            })
    }
}


/**
 * Deactivate a rule
 * @param index
 */
export const deactivate = (index) => {
    return (dispatch, getState) => {
        const {id} = getState().rules.get(index)
        return axios.put(`/api/rules/${id}/`, {deactivated_datetime: new Date()})
            .then(() => {
                dispatch(({
                    type: types.DEACTIVATE_RULE,
                    index,
                }))
                dispatch(notify({
                    type: 'success',
                    message: 'Rule deactivated successfully',
                }))
            })
            .catch(error => {
                return dispatch(fail(error, 'Unable to deactivate the rule'))
            })
    }
}

/**
 * Delete a rule
 * @param index
 */
export const remove = (index) => {
    return (dispatch, getState) => {
        const {id} = getState().rules.get(index)
        return axios.put(`/api/rules/${id}/`, {deleted_datetime: new Date()})
            .then(() => {
                dispatch(({
                    type: types.REMOVE_RULE,
                    index,
                }))
                dispatch(notify({
                    type: 'success',
                    message: 'Rule removed successfully',
                }))
            })
            .catch(error => {
                return dispatch(fail(error, 'Unable to remove the rule'))
            })
    }
}

/**
 * Reset the code ast of a rule
 * @param index
 */
export const reset = (index) => {
    return (dispatch, getState) => {
        const {id} = getState().rules.get(index)
        return axios.get(`/api/rules/${id}`)
            .then((json = {}) => json.data)
            .then(response => dispatch(modifyCodeast(
                index,
                List([]),
                response.code_ast || types.DEFAULT_IF_STATEMENT,
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
            })
            .catch(error => {
                return dispatch(fail(error, 'Unable to receive rules'))
            })
    }
}
