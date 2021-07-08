import axios, {AxiosError} from 'axios'
import {fromJS, List, Map} from 'immutable'

import {ApiListResponsePagination} from '../../models/api/types'
import {notify} from '../notifications/actions'
import {StoreDispatch, RootState} from '../types'
import {createErrorNotification} from '../utils'
import {NotificationStatus} from '../notifications/types'

import {Rule, RuleOperation, RuleDraft, RulePriority} from './types'
import * as constants from './constants.js'

export const addRuleStart = (type: string, code: string) => ({
    type: constants.ADD_RULE_START,
    name: type,
    code,
})

export const addRuleEnd = (rule: Rule) => ({
    type: constants.ADD_RULE_END,
    rule,
})

export const requestRules = (url: string) => ({
    type: constants.RULES_REQUESTS_POSTS,
    url,
})

export const receiveRules = (rules: Rule[]) => ({
    type: constants.RULES_RECEIVE_POSTS,
    rules,
})

export const modifyCodeAST = (
    id: string,
    path: List<any>,
    value: Maybe<string | Record<string, unknown>>,
    operation: RuleOperation
) => (
    dispatch: StoreDispatch,
    getState: () => RootState
): ReturnType<StoreDispatch> =>
    dispatch({
        type: constants.RULES_UPDATE_CODE_AST,
        schemas: getState().schemas,
        id,
        path,
        value,
        operation,
    })

export const initialiseCodeAST = (id: string) => ({
    type: constants.RULES_INITIALISE_CODE_AST,
    id,
})

/**
 * Create a rule
 */
export const create = (data: Partial<RuleDraft>) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    return axios.post<Rule>('/api/rules/', data).then(
        (response) => {
            return dispatch(addRuleEnd(response.data))
        },
        (error: AxiosError) => {
            return dispatch(
                createErrorNotification(error, 'Unable to create the rule')
            )
        }
    )
}

/**
 * Save a rule
 */
export const save = (data: RuleDraft) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    dispatch({
        type: constants.UPDATE_RULE_START,
        ruleId: data.id,
        rule: fromJS(data),
    })

    return axios
        .put<Rule>(`/api/rules/${data.id || ''}/`, data)
        .then((json) => json?.data)
        .then(
            (resp) => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Rule saved successfully',
                    })
                )

                return dispatch({
                    type: constants.UPDATE_RULE_SUCCESS,
                    ruleId: data.id,
                    rule: fromJS(resp),
                })
            },
            (error: AxiosError) => {
                dispatch(
                    createErrorNotification(error, 'Unable to save the rule')
                )

                return dispatch({
                    type: constants.UPDATE_RULE_ERROR,
                    ruleId: data.id,
                })
            }
        )
}

/**
 * Activate a rule
 */
export const activate = (id: string) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> =>
    axios
        .put<Rule>(`/api/rules/${id}/`, {deactivated_datetime: null})
        .then((json) => json?.data)
        .then(
            () => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Rule activated successfully',
                    })
                )

                return dispatch({
                    type: constants.ACTIVATE_RULE,
                    id,
                })
            },
            (error: AxiosError) => {
                return dispatch(
                    createErrorNotification(
                        error,
                        'Unable to activate the rule'
                    )
                )
            }
        )

/**
 * Deactivate a rule
 */
export const deactivate = (id: string) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> =>
    axios
        .put<Rule>(`/api/rules/${id}/`, {deactivated_datetime: new Date()})
        .then((json) => json?.data)
        .then(
            () => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Rule deactivated successfully',
                    })
                )

                return dispatch({
                    type: constants.DEACTIVATE_RULE,
                    id,
                })
            },
            (error) => {
                return dispatch(
                    createErrorNotification(
                        error,
                        'Unable to deactivate the rule'
                    )
                )
            }
        )

/**
 * Delete a rule
 */
export const remove = (id: string) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> =>
    axios.delete<void>(`/api/rules/${id}/`).then(
        () => {
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Rule deleted successfully',
                })
            )

            return dispatch({
                type: constants.REMOVE_RULE,
                id,
            })
        },
        (error: AxiosError) => {
            return dispatch(
                createErrorNotification(error, 'Unable to delete the rule')
            )
        }
    )

/**
 * Reset the code ast of a rule
 */
export const reset = (id: string) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> =>
    axios
        .get<Rule>(`/api/rules/${id}`)
        .then((json) => json?.data)
        .then((response) => {
            return dispatch({
                type: constants.RESET_RULE_SUCCESS,
                rule: response,
            })
        })

export function fetchRules() {
    const url = '/api/rules/'
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch(requestRules(url))

        return axios
            .get<ApiListResponsePagination<Rule[]>>(url)
            .then((json) => json?.data)
            .then(
                (resp) => {
                    return dispatch(receiveRules(resp.data))
                },
                (error: AxiosError) => {
                    return dispatch(
                        createErrorNotification(
                            error,
                            'Unable to receive rules'
                        )
                    )
                }
            )
    }
}

export function updateOrder(priorities: RulePriority[]) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: constants.UPDATE_ORDER_START,
            priorities,
        })

        return axios
            .post<Rule[]>('/api/rules/priorities/', {priorities})
            .then((json) => json?.data)
            .then(
                (resp) => {
                    return dispatch(receiveRules(resp))
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: constants.UPDATE_ORDER_ERROR,
                        error,
                        reason: 'Failed to update list of rules',
                    })
                }
            )
    }
}

export function ruleUpdated(rule: Map<any, any>) {
    return (dispatch: StoreDispatch) =>
        dispatch({
            type: constants.RULE_UPDATED,
            payload: rule,
        })
}
