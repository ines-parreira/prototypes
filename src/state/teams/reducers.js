// @flow

import {fromJS, type Map} from 'immutable'

import {actionType} from '../types'

import * as constants from './constants'

export const initialState = fromJS({
    all: {},
})

export default function reducer(state: Map<*, *> = initialState, action: actionType): Map<*, *> {
    switch (action.type) {
        case constants.CREATE_TEAM_SUCCESS:
        case constants.UPDATE_TEAM_SUCCESS:
        case constants.FETCH_TEAM_SUCCESS:
            return state.setIn(['all', action.payload.id], fromJS(action.payload))
        case constants.DELETE_TEAM_SUCCESS:
            return state.deleteIn(['all', action.payload])
        default:
            return state
    }
}
