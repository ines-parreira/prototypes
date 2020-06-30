// @flow
import {fromJS} from 'immutable'
import _isUndefined from 'lodash/isUndefined'

// types
import type {Map} from 'immutable'

import type {actionType} from '../types'

import * as constants from './constants'

export const initialState = fromJS({
    settings: [],
    _internal: {
        loading: {
            settings: {},
            currentUser: false,
        },
    },
})

export default function reducer(
    state: Map<*, *> = initialState,
    action: actionType
): Map<*, *> {
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
            return fromJS(action.resp).setIn(
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
                return newState.update('settings', (settings) => {
                    return settings.map((setting) => {
                        if (setting.get('id') === action.resp.id) {
                            return setting.set('data', fromJS(action.resp.data))
                        }
                        return setting
                    })
                })
            }
            return newState.update('settings', (settings) =>
                settings.push(fromJS(action.resp))
            )
        }
        case constants.TOGGLE_ACTIVE_STATUS:
            return state.update('is_active', (status) =>
                _isUndefined(action.status) ? !status : action.status
            )
        default:
            return state
    }
}
