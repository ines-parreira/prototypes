import * as userTypes from '../users/constants'
import * as types from './constants'
import {fromJS} from 'immutable'
import {isUndefined as _isUndefined} from 'lodash'

export const initialState = fromJS({
    settings: [],
    _internal: {
        loading: {
            settings: {},
            currentUser: false
        }
    }
})

const Raven = window.Raven

export default (state = initialState, action) => {
    if (!action) {
        return state
    }

    switch (action.type) {
        case userTypes.FETCH_CURRENT_USER_START:
        case userTypes.SUBMIT_CURRENT_USER_START:
        case types.CHANGE_PASSWORD_START:
            return state.setIn(['_internal', 'loading', 'currentUser'], true)

        case types.SUBMIT_SETTING_START:
            return state.setIn(['_internal', 'loading', 'settings', action.settingType], true)

        case userTypes.FETCH_CURRENT_USER_SUCCESS:
            return fromJS(action.resp).setIn(['_internal', 'loading', 'currentUser'], false)

        case userTypes.SUBMIT_CURRENT_USER_SUCCESS:
        case types.CHANGE_PASSWORD_SUCCESS:
            return fromJS(action.resp).setIn(['_internal', 'loading', 'currentUser'], false)

        case types.CHANGE_PASSWORD_ERROR:
            return state.setIn(['_internal', 'loading', 'currentUser'], false)

        case userTypes.SUBMIT_CURRENT_USER_ERROR: {
            return state.setIn(['_internal', 'loading', 'currentUser'], false)
        }

        case types.SUBMIT_SETTING_ERROR: {
            return state.setIn(['_internal', 'loading', 'settings', action.settingType], false)
        }

        case types.SUBMIT_SETTING_SUCCESS: {
            const newState = state.setIn(['_internal', 'loading', 'settings', action.settingType], false)
            if (action.isUpdate) {
                return newState.update('settings', settings => {
                    return settings.map(setting => {
                        if (setting.get('id') === action.resp.id) {
                            return setting.set('data', fromJS(action.resp.data))
                        }
                        return setting
                    })
                })
            }
            return newState.update('settings', settings => settings.push(fromJS(action.resp)))
        }
        default:
            return state
    }
}
