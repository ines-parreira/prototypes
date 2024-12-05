import {createAction} from '@reduxjs/toolkit'
import {AxiosError} from 'axios'
import _get from 'lodash/get'
import _isUndefined from 'lodash/isUndefined'
import moment from 'moment-timezone'

import {AlertBannerTypes} from 'AlertBanners'
import {
    User,
    EditableUserProfile,
    UserSetting,
    UserPreferences,
    UserSettingType,
} from 'config/types/user'
import {DateAndTimeFormatting} from 'constants/datetime'
import client from 'models/api/resources'
import history from 'pages/history'
import {check2FARequired} from 'pages/settings/yourProfile/twoFactorAuthentication/utils'
import {fetchChats} from 'state/chats/actions'
import * as currentAccountSelectors from 'state/currentAccount/selectors'
import {
    OPEN_TWO_FA_MODAL_URL,
    TWO_FA_REQUIRED_NOTIFICATION_ID,
} from 'state/currentUser/constants'
import {notify} from 'state/notifications/actions'
import {NotificationStatus, NotificationStyle} from 'state/notifications/types'
import {formatDatetime} from 'utils'
import {getDateAndTimeFormat} from 'utils/datetime'

import type {StoreDispatch, RootState} from '../types'
import * as constants from './constants'
import * as currentUserSelectors from './selectors'

export const changePassword =
    (oldPassword: string, newPassword: string, twoFACode?: string) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({type: constants.CHANGE_PASSWORD_START})

        const payload: {[id: string]: string} = {
            old_password: oldPassword,
            new_password: newPassword,
        }

        if (twoFACode) {
            payload['two_fa_code'] = twoFACode
        }

        return client
            .put<User>('/api/users/0/', payload)
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

        return client
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
        const prevIsAvailableForChat: boolean =
            currentUserSelectors.isAvailable(getState())
        let promise

        dispatch({
            type: constants.SUBMIT_SETTING_START,
            settingType: data.type,
        })

        if (data.id != null) {
            promise = client.put<
                UserSetting & Omit<{[key: string]: unknown}, keyof UserSetting>
            >(`/api/users/0/settings/${data.id}/`, data)
        } else {
            promise = client.post<
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

export const toggleActiveStatus =
    (status: Maybe<boolean>) =>
    (dispatch: StoreDispatch, getState: () => RootState) => {
        const {currentUser} = getState()
        const currentStatus = currentUser.get('is_active')

        if (_isUndefined(status) || status !== currentStatus) {
            dispatch({
                type: constants.TOGGLE_ACTIVE_STATUS,
                status,
            })
        }
    }

export const setIsAvailable = createAction<boolean>(constants.SET_IS_AVAILABLE)

export const update2FAEnabled =
    (status: boolean) =>
    (dispatch: StoreDispatch, getState: () => RootState) => {
        const currentStatus: boolean =
            currentUserSelectors.has2FaEnabled(getState())

        let action = status ? 'activated' : 'disabled'

        if (status === currentStatus) {
            action = 'updated'
        }

        // Show a success notification
        void dispatch(
            notify({
                status: NotificationStatus.Success,
                message: `Two-Factor Authentication has successfully been ${action}`,
            })
        )

        // Update the value in the currentUser object
        dispatch({
            type: constants.UPDATE_2FA_STATUS,
            status,
        })
    }

export const handle2FAEnforced =
    () => (dispatch: StoreDispatch, getState: () => RootState) => {
        const state = getState()

        const dateFormatSetting =
            currentUserSelectors.getDateFormatPreferenceSetting(state)
        const timeFormatSetting =
            currentUserSelectors.getTimeFormatPreferenceSetting(state)
        const datetimeFormat = getDateAndTimeFormat(
            dateFormatSetting,
            timeFormatSetting,
            DateAndTimeFormatting.CompactDate
        )

        const userTimezone = currentUserSelectors.getTimezone(state)
        const twoFAEnforcedDatetime =
            currentAccountSelectors.getTwoFAEnforcedDatetime(state)
        const has2FAEnabled = currentUserSelectors.has2FaEnabled(state)
        const is2FARequired = check2FARequired(
            twoFAEnforcedDatetime,
            has2FAEnabled
        )

        // If 2FA is required redirect to the 2FA page and open the setup modal as not dismissible
        if (is2FARequired) {
            history.push(OPEN_TWO_FA_MODAL_URL)
            return
        }

        // Show a global banner if the 2fa is not required yet (see check2FARequired util function to see the condition on that)
        if (!!twoFAEnforcedDatetime && !has2FAEnabled) {
            const twoFASetupDueDate = formatDatetime(
                moment.utc(twoFAEnforcedDatetime),
                datetimeFormat,
                userTimezone
            )

            void dispatch(
                notify({
                    id: TWO_FA_REQUIRED_NOTIFICATION_ID,
                    style: NotificationStyle.Banner,
                    type: AlertBannerTypes.Warning,
                    message: `Action required: your admin requires you to enable Two-Factor Authentication (2FA) before ${twoFASetupDueDate.toString()}.`,
                    CTA: {
                        type: 'action',
                        text: 'Setup 2FA',
                        onClick: () => {
                            history.push(OPEN_TWO_FA_MODAL_URL)
                        },
                    },
                })
            )
        }
    }
