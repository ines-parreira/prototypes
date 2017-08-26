import * as types from './constants'
import {fromJS} from 'immutable'

export const initialState = fromJS({
    settings: [],
    _internal: {
        loading: {}
    }
})

export default (state = initialState, action) => {
    switch (action.type) {
        case types.UPDATE_ACCOUNT_START:
            return state.setIn(['_internal', 'loading', 'updateAccount'], true)
        case types.UPDATE_ACCOUNT_ERROR:
            return state.setIn(['_internal', 'loading', 'updateAccount'], false)
        case types.UPDATE_ACCOUNT_SUCCESS:
            return state.setIn(['_internal', 'loading', 'updateAccount'], false).merge(action.resp)
        case types.UPDATE_ACCOUNT_SETTING: {
            const new_setting = action.setting

            if (!action.isUpdate) {
                return state.update('settings', settings => settings.push(fromJS(new_setting)))
            }

            return state
                .update('settings', settings => settings
                    .map(setting => {
                        if (setting.get('id') === new_setting.id) {
                            return fromJS(new_setting)
                        }
                        return setting
                    })
                )
        }
        default:
            return state
    }
}
