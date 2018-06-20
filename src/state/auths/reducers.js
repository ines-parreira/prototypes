// @flow
import {fromJS} from 'immutable'
import type {Map} from 'immutable'
import type {actionType} from '../types'

import * as constants from './constants'

export const initialState = fromJS({})

export default (state: Map<*,*> = initialState, action: actionType): Map<*,*> => {
    switch (action.type) {
        case constants.FETCH_USER_AUTHS_SUCCESS: {
            return fromJS(action.resp)
        }

        default:
            return state
    }
}
