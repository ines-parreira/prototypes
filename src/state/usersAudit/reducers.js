// @flow
import {type Map, fromJS} from 'immutable'

import type {actionType} from '../types'

import * as constants from './constants'

export const initialState = fromJS({
    events: [],
    meta: {}
})

export default (state: Map<*, *> = initialState, action: actionType): Map<*, *> => {
    switch (action.type) {
        case constants.FETCH_USERS_AUDIT_SUCCESS: {
            return fromJS({
                events: action.events,
                meta: action.meta
            })
        }
        default:
            return state
    }
}
