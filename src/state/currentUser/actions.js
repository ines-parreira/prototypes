// @flow
import axios from 'axios'
import _isUndefined from 'lodash/isUndefined'
import _get from 'lodash/get'

import {notify} from '../notifications/actions'

// types
import type {Dispatch, getStateType} from '../types'
import {fetchChats} from '../chats/actions'

import * as constants from './constants'
import * as currentUserSelectors from './selectors'

export const changePassword = (oldPassword: string, newPassword: string) => (
    dispatch: Dispatch
): Promise<Dispatch> => {
    dispatch({type: constants.CHANGE_PASSWORD_START})

    return axios
        .put('/api/users/0/', {
            old_password: oldPassword,
            new_password: newPassword,
        })
        .then((json = {}) => json.data)
        .then(
            (resp) => {
                dispatch({
                    type: constants.CHANGE_PASSWORD_SUCCESS,
                    resp,
                })
                dispatch(
                    notify({
                        status: 'success',
                        message: 'Password successfully changed!',
                    })
                )
            },
            (error) => {
                return dispatch({
                    type: constants.CHANGE_PASSWORD_ERROR,
                    error,
                    reason: 'Failed to modify your password',
                })
            }
        )
}

export function updateCurrentUser(data: Object) {
    return (dispatch: Dispatch): Promise<Dispatch> => {
        dispatch({
            type: constants.SUBMIT_CURRENT_USER_START,
        })

        return axios
            .put('/api/users/0/', data)
            .then((json = {}) => json.data)
            .then(
                (resp) => {
                    dispatch({
                        type: constants.SUBMIT_CURRENT_USER_SUCCESS,
                        resp,
                    })

                    let message
                    if (_get(data, ['meta', 'profile_picture_url'])) {
                        message = 'User picture successfully updated'
                    } else {
                        message = 'User successfully updated'
                    }
                    dispatch(
                        notify({
                            status: 'success',
                            message,
                        })
                    )

                    return resp
                },
                (error) => {
                    return dispatch({
                        type: constants.SUBMIT_CURRENT_USER_ERROR,
                        error,
                        verbose: true,
                        reason: 'Failed to update user',
                    })
                }
            )
    }
}

export function submitSetting(
    data: {id?: string, type: string, data: Object},
    notification: boolean
) {
    return (
        dispatch: Dispatch,
        getState: getStateType
    ): Promise<Dispatch | {}> => {
        const isUpdate = !!data.id
        const prevIsAvailableForChat = currentUserSelectors.isAvailable(
            getState()
        )
        let promise

        dispatch({
            type: constants.SUBMIT_SETTING_START,
            settingType: data.type,
        })

        if (isUpdate) {
            // $FlowFixMe
            promise = axios.put(`/api/users/0/settings/${data.id}/`, data)
        } else {
            promise = axios.post('/api/users/0/settings/', data)
        }

        return promise
            .then((json = {}) => json.data)
            .then(
                (resp) => {
                    dispatch({
                        type: constants.SUBMIT_SETTING_SUCCESS,
                        settingType: data.type,
                        isUpdate,
                        resp,
                    })

                    // Refresh chat tickets if the current user updates his availability
                    if (prevIsAvailableForChat !== data.data.available) {
                        dispatch(fetchChats())
                    }

                    if (notification) {
                        dispatch(
                            notify({
                                status: 'success',
                                message: 'Settings successfully updated',
                            })
                        )
                    }

                    return resp
                },
                (error) => {
                    return dispatch({
                        type: constants.SUBMIT_SETTING_ERROR,
                        settingType: data.type,
                        error,
                        reason: 'Failed to update settings',
                    })
                }
            )
    }
}

export const toggleActiveStatus = (status: ?boolean) => (
    dispatch: Dispatch,
    getState: getStateType
) => {
    const {currentUser} = getState()
    const currentStatus = currentUser.get('is_active')

    if (_isUndefined(status) || status !== currentStatus) {
        dispatch({
            type: constants.TOGGLE_ACTIVE_STATUS,
            status,
        })
    }
}
