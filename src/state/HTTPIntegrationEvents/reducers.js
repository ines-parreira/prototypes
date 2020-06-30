// @flow
import {fromJS} from 'immutable'

import type {Map} from 'immutable'

import type {actionType} from '../types'

import * as constants from './constants'

export const initialState = fromJS({
    events: [],
    event: {},
})

export default function reducer(
    state: Map<*, *> = initialState,
    action: actionType
): Map<*, *> {
    switch (action.type) {
        case constants.FETCH_HTTP_INTEGRATION_EVENTS_SUCCESS:
            return state.set('events', fromJS(action.events))

        case constants.FETCH_HTTP_INTEGRATION_EVENT_SUCCESS:
            return state.set('event', fromJS(action.event))

        default:
            return state
    }
}
