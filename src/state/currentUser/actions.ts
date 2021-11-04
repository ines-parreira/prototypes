import axios, {AxiosError} from 'axios'
import _isUndefined from 'lodash/isUndefined'
import _get from 'lodash/get'

import {notify} from '../notifications/actions'

import type {StoreDispatch, RootState} from '../types'
import {fetchChats} from '../chats/actions'
import {NotificationStatus} from '../notifications/types'
import {
    User,
    EditableUserProfile,
    UserSetting,
    UserPreferences,
    UserSettingType,
} from '../../config/types/user'

import * as constants from './constants.js'
import * as currentUserSelectors from './selectors'

export const changePassword = (oldPassword: string, newPassword: string) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    dispatch({type: constants.CHANGE_PASSWORD_START})

    return axios
        .put<User>('/api/users/0/', {
            old_password: oldPassword,
            new_password: newPassword,
        })
        .then((json) => json?.data)
        .then(
            (resp) => {
                dispatch({
                    type: constants.CHANGE_PASSWORD_SUCCESS,
                    resp,
                })
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Password successfully changed!',
                    })
                )
            },
            (error: AxiosError) => {
                return dispatch({
                    type: constants.CHANGE_PASSWORD_ERROR,
                    error,
                    reason: 'Failed to modify your password',
                })
            }
        )
}

export function updateCurrentUser(data: Partial<EditableUserProfile>) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: constants.SUBMIT_CURRENT_USER_START,
        })

        return axios
            .put<User>('/api/users/0/', data)
            .then((json) => json?.data)
            .then(
                (resp) => {
                    dispatch({
                        type: constants.SUBMIT_CURRENT_USER_SUCCESS,
                        resp,
                    })
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: _get(data, ['meta', 'profile_picture_url'])
                                ? 'User picture successfully updated'
                                : 'User successfully updated',
                        })
                    )

                    return resp
                },
                (error: AxiosError) => {
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

export function submitSettingSuccess(setting: UserSetting, isUpdate: boolean) {
    return {
        type: constants.SUBMIT_SETTING_SUCCESS,
        settingType: setting.type,
        isUpdate,
        resp: setting,
    }
}

export function submitSetting(data: UserSetting, notification: boolean) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<ReturnType<StoreDispatch>> => {
        const prevIsAvailableForChat: boolean = currentUserSelectors.isAvailable(
            getState()
        )
        let promise

        dispatch({
            type: constants.SUBMIT_SETTING_START,
            settingType: data.type,
        })

        if (data.id != null) {
            promise = axios.put<
                UserSetting & Omit<{[key: string]: unknown}, keyof UserSetting>
            >(`/api/users/0/settings/${data.id}/`, data)
        } else {
            promise = axios.post<
                UserSetting & Omit<{[key: string]: unknown}, keyof UserSetting>
            >('/api/users/0/settings/', data)
        }

        return promise
            .then((json) => json?.data)
            .then(
                (resp) => {
                    const {id, type, data: respData} = resp
                    dispatch(
                        submitSettingSuccess(
                            {id, type, data: respData} as UserSetting,
                            !!data.id
                        )
                    )

                    // Refresh chat tickets if the current user updates his availability
                    if (
                        prevIsAvailableForChat !==
                        (data.data as UserPreferences).available
                    ) {
                        void dispatch(fetchChats())
                    }

                    if (notification) {
                        void dispatch(
                            notify({
                                status: NotificationStatus.Success,
                                message: 'Settings successfully updated',
                            })
                        )
                    }

                    return resp
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: constants.SUBMIT_SETTING_ERROR,
                        settingType: data.type,
                        error,
                        reason: 'Failed to update settings',
                        verbose: data.type === UserSettingType.Preferences,
                    })
                }
            )
    }
}

export const toggleActiveStatus = (status: Maybe<boolean>) => (
    dispatch: StoreDispatch,
    getState: () => RootState
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
