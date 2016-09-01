import * as types from '../users/constants'
import {Map, fromJS} from 'immutable'
import moment from 'moment'
import {isUndefined as _isUndefined} from 'lodash'

export const currentUserInitial = Map()

const Raven = window.Raven

export function currentUser(state = currentUserInitial, action) {
    if (!action) {
        return state
    }

    switch (action.type) {
        case types.FETCH_CURRENT_USER_SUCCESS:
            // set default locale and timezone
            if (action.resp.language) {
                moment.locale(action.resp.language)
            }

            if (action.resp.timezone) {
                moment.tz.setDefault(action.resp.timezone)
            }

            if (!_isUndefined(Raven) && Raven.setUserContext) {
                const user = action.resp

                Raven.setUserContext({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                })
            }

            return fromJS(action.resp)

        case types.UPDATE_USER_SUCCESS:
            if (action.userId === state.get('id')) {
                return fromJS(action.resp)
            }
            return state

        default:
            return state
    }
}
