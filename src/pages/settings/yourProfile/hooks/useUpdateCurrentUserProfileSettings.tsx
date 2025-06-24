import {
    useCreateCurrentUserSettings,
    UserSettingType,
    useUpdateCurrentUserSettings,
} from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import * as constants from 'state/currentUser/constants'

export function useUpdateCurrentUserProfileSettings() {
    const dispatch = useAppDispatch()

    return useUpdateCurrentUserSettings({
        mutation: {
            onSuccess: (response) => {
                dispatch({
                    type: constants.SUBMIT_SETTING_SUCCESS,
                    settingType: response.data.type,
                    isUpdate: true,
                    resp: response.data,
                })
            },
            onError: (error, variables) => {
                dispatch({
                    type: constants.SUBMIT_SETTING_ERROR,
                    settingType: variables.data.type,
                    error,
                    reason: 'Failed to update settings',
                    verbose:
                        variables.data.type === UserSettingType.Preferences,
                })
            },
        },
    })
}

export function useCreateCurrentUserProfileSettings() {
    const dispatch = useAppDispatch()

    return useCreateCurrentUserSettings({
        mutation: {
            onSuccess: (response) => {
                dispatch({
                    type: constants.SUBMIT_SETTING_SUCCESS,
                    settingType: response.data.type,
                    isUpdate: false,
                    resp: response.data,
                })
            },
            onError: (error, variables) => {
                dispatch({
                    type: constants.SUBMIT_SETTING_ERROR,
                    settingType: variables.data.type,
                    error,
                    reason: 'Failed to create settings',
                    verbose:
                        variables.data.type === UserSettingType.Preferences,
                })
            },
        },
    })
}
