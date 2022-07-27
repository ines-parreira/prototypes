import {fromJS, Map, List} from 'immutable'
import _isUndefined from 'lodash/isUndefined'

import {UserSetting} from '../../config/types/user'
import {GorgiasAction} from '../types'

import * as constants from './constants'
import {CurrentUserState} from './types'

export const initialState: CurrentUserState = fromJS({
    settings: [],
    _internal: {
        loading: {
            settings: {},
            currentUser: false,
        },
    },
})

export default function reducer(
    state: CurrentUserState = initialState,
    action: GorgiasAction
): CurrentUserState {
    if (!action) {
        return state
    }

    switch (action.type) {
        case constants.SUBMIT_CURRENT_USER_START:
        case constants.CHANGE_PASSWORD_START:
            return state.setIn(['_internal', 'loading', 'currentUser'], true)

        case constants.CHANGE_PASSWORD_ERROR:
        case constants.SUBMIT_CURRENT_USER_ERROR:
            return state.setIn(['_internal', 'loading', 'currentUser'], false)

        case constants.SUBMIT_CURRENT_USER_SUCCESS:
        case constants.CHANGE_PASSWORD_SUCCESS:
            return (fromJS(action.resp) as Map<any, any>).setIn(
                ['_internal', 'loading', 'currentUser'],
                false
            )

        case constants.SUBMIT_SETTING_START:
            return state.setIn(
                ['_internal', 'loading', 'settings', action.settingType],
                true
            )

        case constants.SUBMIT_SETTING_ERROR:
            return state.setIn(
                ['_internal', 'loading', 'settings', action.settingType],
                false
            )

        case constants.SUBMIT_SETTING_SUCCESS: {
            const newState = state.setIn(
                ['_internal', 'loading', 'settings', action.settingType],
                false
            )
            if (action.isUpdate) {
                return newState.update('settings', (settings: List<any>) => {
                    return settings.map((setting: Map<any, any>) => {
                        if (
                            setting.get('id') ===
                            (action.resp as UserSetting).id
                        ) {
                            return setting.set(
                                'data',
                                fromJS((action.resp as UserSetting).data)
                            )
                        }
                        return setting
                    })
                })
            }
            return newState.update('settings', (settings: List<any>) =>
                settings.push(fromJS(action.resp))
            )
        }

        case constants.TOGGLE_ACTIVE_STATUS:
            return state.update('is_active', (status) =>
                _isUndefined(action.status) ? !status : action.status
            )

        case constants.SET_IS_AVAILABLE:
            return state.update('settings', (settings: List<any>) =>
                settings.map((setting: Map<any, any>) => {
                    if (setting.get('type') === 'preferences') {
                        return setting.setIn(
                            ['data', 'available'],
                            action.payload
                        )
                    }
                    return setting
                })
            )

        case constants.UPDATE_2FA_STATUS:
            return state.update('has_2fa_enabled', () => action.status)

        default:
            return state
    }
}
