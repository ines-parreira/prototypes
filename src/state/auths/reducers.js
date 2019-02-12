// @flow
import {fromJS} from 'immutable'
import type {List} from 'immutable'

import type {actionType} from '../types'

import * as constants from './constants'

export const initialState = fromJS([])

export default (state: List<*> = initialState, action: actionType): List<*> => {
    switch (action.type) {
        case constants.FETCH_USER_AUTHS_SUCCESS: {
            return fromJS(action.resp)
        }

        case constants.RESET_API_KEY_SUCCESS: {
            return state.set(
                state.findIndex((auth) => auth.type === 'api_key'),
                fromJS(action.resp)
            )
        }

        default:
            return state
    }
}
