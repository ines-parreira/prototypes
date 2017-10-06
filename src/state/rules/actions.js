// @flow
import axios from 'axios'
import {fromJS, List} from 'immutable'

import * as constants from './constants'
import {notify} from '../notifications/actions'

import type {dispatchType, getStateType} from '../types'
import type {ruleType} from './types'
type operationType = 'UPDATE' | 'INSERT' | 'DELETE' | 'UPDATE_LOGICAL_OPERATOR' | 'DELETE_BINARY_EXPRESSION'

export const addRuleStart = (type: string, code: string) => ({
    type: constants.ADD_RULE_START,
    title: type,
    code
})

export const addRuleEnd = (rule: ruleType) => ({
    type: constants.ADD_RULE_END,
    rule
})

export const requestRules = (url: string) => ({
    type: constants.RULES_REQUESTS_POSTS,
    url
})

export const receiveRules = (rules: Array<ruleType>) => ({
    type: constants.RULES_RECEIVE_POSTS,
    rules
})

export const modifyCodeAST = (id: string, path: List<*>, value: string, operation: operationType) => (dispatch: dispatchType, getState: getStateType): dispatchType=> (
    dispatch({
        type: constants.RULES_UPDATE_CODE_AST,
        schemas: getState().schemas,
        id,
        path,
        value,
        operation,
    })
)

export const initialiseCodeAST = (id: string) => ({
    type: constants.RULES_INITIALISE_CODE_AST,
    id,
})

export const fail = (error: {} = {}, reason: string) => ({
    type: 'ERROR',
    error,
    reason,
})

/**
 * Create a rule
 * @param data
 */
export const create = (data: ruleType) => (dispatch: dispatchType): Promise<dispatchType> => {
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
export const save = (data: ruleType) => (dispatch: dispatchType): Promise<dispatchType> => {
    dispatch({
        type: constants.UPDATE_RULE_START,
        ruleId: data.id,
        rule: fromJS(data),
    })

    return axios.put(`/api/rules/${data.id}/`, data)
        .then((json = {}) => json.data)
        .then((resp) => {
            dispatch(notify({
                status: 'success',
                message: 'Rule saved successfully',
            }))

            return dispatch({
                type: constants.UPDATE_RULE_SUCCESS,
                ruleId: data.id,
                rule: fromJS(resp),
            })
        }, (error) => {
            dispatch(fail(error, 'Unable to save the rule'))

            return dispatch({
                type: constants.UPDATE_RULE_ERROR,
                ruleId: data.id
            })
        })
}

/**
 * Activate a rule
 * @param id rule id
 */
export const activate = (id: string) => (dispatch: dispatchType): Promise<dispatchType> => (
    axios.put(`/api/rules/${id}/`, {deactivated_datetime: null})
        .then((json = {}) => json.data)
        .then(() => {
            dispatch(notify({
                status: 'success',
                message: 'Rule activated successfully',
            }))

            return dispatch(({
                type: constants.ACTIVATE_RULE,
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
export const deactivate = (id: string) => (dispatch: dispatchType): Promise<dispatchType> => (
    axios.put(`/api/rules/${id}/`, {deactivated_datetime: new Date()})
        .then((json = {}) => json.data)
        .then(() => {
            dispatch(notify({
                status: 'success',
                message: 'Rule deactivated successfully',
            }))

            return dispatch(({
                type: constants.DEACTIVATE_RULE,
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
export const remove = (id: string) => (dispatch: dispatchType): Promise<dispatchType> => (
    axios.delete(`/api/rules/${id}/`)
        .then((json = {}) => json.data)
        .then(() => {
            dispatch(notify({
                status: 'success',
                message: 'Rule deleted successfully',
            }))

            return dispatch(({
                type: constants.REMOVE_RULE,
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
export const reset = (id: string) => (dispatch: dispatchType): Promise<dispatchType> => (
    axios.get(`/api/rules/${id}`)
        .then((json = {}) => json.data)
        .then(response => {
            dispatch({
                type: constants.RESET_RULE_SUCCESS,
                ruleId: id
            })
            return dispatch(modifyCodeAST(
                id,
                List([]),
                response.code_ast || constants.DEFAULT_STATEMENT,
                'UPDATE'
            ))
        })
)

export function fetchRules() {
    const url = '/api/rules/'
    return (dispatch: dispatchType): Promise<dispatchType> => {
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

export function updateOrder(priorities: {}) {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        dispatch({
            type: constants.UPDATE_ORDER_START,
            priorities,
        })

        return axios.post('/api/rules/priorities/', {priorities})
            .then((json = {}) => json.data)
            .then((resp) => {
                return dispatch(receiveRules(resp))
            }, error => {
                return dispatch({
                    type: constants.UPDATE_ORDER_ERROR,
                    error,
                    reason: 'Failed to update list of rules'
                })
            })
    }
}

