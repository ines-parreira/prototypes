// @flow
import * as types from './constants'
import {fromJS} from 'immutable'

import type {Map} from 'immutable'
import type {actionType} from '../types'

export const initialState = fromJS({
    data: {},
    loading: false,
    loaded: false
})

export default (state: Map<*,*> = initialState, action: actionType): Map<*,*> => {
    switch (action.type) {
        case types.FETCH_SETTINGS_START:
            return state.set('loading', true)

        case types.FETCH_SETTINGS_SUCCESS:
            return state.merge({
                data: action.resp,
                loading: false,
                loaded: true
            })

        default:
            return state
    }
}
