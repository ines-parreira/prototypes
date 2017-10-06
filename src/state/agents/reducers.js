// @flow
import {fromJS} from 'immutable'
import * as constants from './constants.js'

import type {Map} from 'immutable'
import {actionType} from '../types'

export const initialState = fromJS({
    pagination: {},
})

export default (state: Map<*,*> = initialState, action: actionType): Map<*,*> => {
    switch (action.type) {
        case constants.FETCH_AGENTS_PAGINATION_SUCCESS: {
            return state.set('pagination', fromJS(action.resp))
        }

        default:
            return state
    }
}
