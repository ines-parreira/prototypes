import {createAction} from '@reduxjs/toolkit'

import {UserViewsOrderingSettingData} from '../../../config/types/user'
import {AccountViewsOrderingSettingData} from '../../currentAccount/types'

import {
    OPTIMISTIC_ACCOUNT_SETTINGS_RESET,
    OPTIMISTIC_ACCOUNT_SETTINGS_SET,
    OPTIMISTIC_USER_SETTINGS_RESET,
    OPTIMISTIC_USER_SETTINGS_SET,
} from './constants'

export const optimisticUserSettingsSet =
    createAction<UserViewsOrderingSettingData>(OPTIMISTIC_USER_SETTINGS_SET)

export const optimisticUserSettingsReset = createAction<void>(
    OPTIMISTIC_USER_SETTINGS_RESET
)

export const optimisticAccountSettingsSet =
    createAction<AccountViewsOrderingSettingData>(
        OPTIMISTIC_ACCOUNT_SETTINGS_SET
    )

export const optimisticAccountSettingsReset = createAction<void>(
    OPTIMISTIC_ACCOUNT_SETTINGS_RESET
)
