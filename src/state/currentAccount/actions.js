// @flow
import axios from 'axios'
import _capitalize from 'lodash/capitalize'
import * as constants from './constants'
import {notify} from '../notifications/actions'

import type {dispatchType} from '../types'

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
        .then(resp => {
            dispatch({
                type: constants.UPDATE_ACCOUNT_SUCCESS,
                resp
            })
            dispatch(notify({
                status: 'success',
                message: 'Account settings successfully updated!'
            }))
        }, error => {
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
            .then(setting => {
                dispatch(notify({
                    status: 'success',
                    message: `${_capitalize(setting.type)} settings saved`
                }))

                return dispatch({
                    type: constants.UPDATE_ACCOUNT_SETTING,
                    isUpdate,
                    setting
                })

            }, error => {
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
