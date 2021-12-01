import {fromJS} from 'immutable'

import {GorgiasAction} from '../types'

import * as constants from './constants'
import {AuthsState, AuthItem} from './types'

export const initialState: AuthsState = fromJS([])

export default function reducer(
    state: AuthsState = initialState,
    action: GorgiasAction
): AuthsState {
    switch (action.type) {
        case constants.FETCH_USER_AUTHS_SUCCESS: {
            return fromJS(action.resp) as AuthsState
        }

        case constants.RESET_API_KEY_SUCCESS: {
            return state.set(
                state.findIndex((auth: AuthItem) => auth.type === 'api_key'),
                fromJS(action.resp)
            )
        }

        default:
            return state
    }
}
