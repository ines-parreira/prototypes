import * as userTypes from '../users/constants'
import * as types from './constants'
import {fromJS} from 'immutable'
import {isUndefined as _isUndefined} from 'lodash'

export const initialState = fromJS({
    _internal: {
        loading: false
    }
})

const Raven = window.Raven

export default (state = initialState, action) => {
    if (!action) {
        return state
    }

    switch (action.type) {
        case userTypes.FETCH_CURRENT_USER_START:
        case userTypes.UPDATE_CURRENT_USER_START:
        case types.CHANGE_PASSWORD_START:
            return state.setIn(['_internal', 'loading'], true)

        case userTypes.FETCH_CURRENT_USER_SUCCESS:
            if (!_isUndefined(Raven) && Raven.setUserContext) {
                const user = action.resp

                Raven.setUserContext({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                })
            }

            return fromJS(action.resp).setIn(['_internal', 'loading'], false)

        case userTypes.UPDATE_CURRENT_USER_SUCCESS:
            return fromJS(action.resp).setIn(['_internal', 'loading'], false)

        case types.CHANGE_PASSWORD_ERROR:
        case types.CHANGE_PASSWORD_SUCCESS:
        case userTypes.UPDATE_CURRENT_USER_ERROR:
            return state.setIn(['_internal', 'loading'], false)

        default:
            return state
    }
}
