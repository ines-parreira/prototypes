import * as actions from '../actions/user'
import {Map} from 'immutable'
import moment from 'moment'

const initial = Map()

export function currentUser(state = initial, action) {
    switch (action.type) {
        case actions.FETCH_CURRENT_USER_SUCCESS:
            // set default locale and timezone
            if (action.resp.language) {
                moment.locale(action.resp.language)
            }

            if (action.resp.timezone) {
                moment.tz.setDefault(action.resp.timezone)
            }
            if (window.Raven && window.Raven.setUserContext) {
                window.Raven.setUserContext(action.resp)
            }

            return Map(action.resp)
        default:
            return state
    }
}
