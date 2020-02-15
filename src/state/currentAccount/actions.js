// @flow
import axios from 'axios'
import _capitalize from 'lodash/capitalize'

import {notify} from '../notifications/actions'
import GorgiasApi from '../../services/gorgiasApi'
import type {dispatchType} from '../types'

import * as constants from './constants'

type settingType = {
    id: string,
    type: string
}

export const updateAccountSuccess = (resp: {}) => ((dispatch: dispatchType) => {
    dispatch({
        type: constants.UPDATE_ACCOUNT_SUCCESS,
        resp
    })
})

export const updateAccount = (values: {}) => ((dispatch: dispatchType): Promise<dispatchType> => {
    dispatch({type: constants.UPDATE_ACCOUNT_START})

    return axios.put('/api/account/', values)
        .then((json = {}) => json.data)
        .then((resp) => {
            dispatch({
                type: constants.UPDATE_ACCOUNT_SUCCESS,
                resp
            })
            dispatch(notify({
                status: 'success',
                message: 'Account settings successfully updated!'
            }))
        }, (error) => {
            return dispatch({
                type: constants.UPDATE_ACCOUNT_ERROR,
                error,
                reason: 'Failed to update account settings'
            })
        })
})

export function submitSetting(setting: settingType) {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        const isUpdate = !!setting.id
        let promise

        if (isUpdate) {
            promise = axios.put(`/api/account/settings/${setting.id}/`, setting)
        } else {
            promise = axios.post('/api/account/settings/', setting)
        }
        return promise
            .then((json = {}) => json.data)
            .then((setting) => {
                dispatch(notify({
                    status: 'success',
                    message: `${_capitalize(setting.type)} settings saved`
                }))

                return dispatch({
                    type: constants.UPDATE_ACCOUNT_SETTING,
                    isUpdate,
                    setting
                })

            }, (error) => {
                return dispatch({
                    type: constants.UPDATE_ACCOUNT_SETTING_ERROR,
                    error,
                    reason: `Failed to update ${setting.type} settings`
                })
            })
    }
}

export function updateSubscription(subscription: {}) {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        return axios.put('/api/billing/subscription/', subscription)
            .then((json = {}) => json.data)
            .then((resp) => {
                dispatch(notify({
                    status: 'success',
                    message: 'Your subscription was updated.',
                }))
                return dispatch({
                    type: constants.UPDATE_SUBSCRIPTION_SUCCESS,
                    subscription: resp,
                })
            }, (error) => {
                return dispatch({
                    type: constants.UPDATE_SUBSCRIPTION_ERROR,
                    error,
                    reason: 'Failed to update the current subscription.'
                })
            })
    }
}

/**
 * Set the subscription of the current account.
 *
 * @param subscription - A Gorgias internal subscription
 * @returns - A Redux action
 */
export const setCurrentSubscription = (subscription: Map<*, *>) => {
    return {
        type: constants.SET_CURRENT_SUBSCRIPTION,
        subscription
    }
}

/**
 * Transfer the current account ownership to a user
 * @param {number} userId - The user ID
 * @returns {Function} the async action thunk
 */
export const updateAccountOwner = (userId: number) => (dispatch: dispatchType): Promise<dispatchType> => {
    return axios.put('/api/account/owner/', {id: userId})
        .then((resp = {}) => resp.data)
        .then(() => {
            dispatch(notify({
                status: 'success',
                message: 'The account owner was successfully​ changed.',
            }))
            return dispatch({
                type: constants.UPDATE_ACCOUNT_OWNER_SUCCESS,
                userId,
            })
        }, (error) => {
            return dispatch({
                type: constants.UPDATE_ACCOUNT_OWNER_ERROR,
                error,
                reason: 'Failed to change the account owner. Please try again in a few seconds.',
            })
        })
}


export const resendVerificationEmail = () => async (dispatch: dispatchType): Promise<dispatchType> => {
    const gorgiasApi = new GorgiasApi()

    try {
        await gorgiasApi.resendAccountVerificationEmail()
        dispatch(notify({
            status: 'success',
            message: 'The verification email has been resent!',
        }))
    } catch (exc) {
        dispatch(notify({
            status: 'error',
            message: exc.response.data.error.msg,
        }))
    }
}
