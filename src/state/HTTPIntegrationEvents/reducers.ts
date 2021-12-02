import {fromJS} from 'immutable'

import {GorgiasAction} from '../types'

import * as constants from './constants'
import {HTTPIntegrationEventsState} from './types'

export const initialState: HTTPIntegrationEventsState = fromJS({
    events: [],
    event: {},
})

export default function reducer(
    state: HTTPIntegrationEventsState = initialState,
    action: GorgiasAction
): HTTPIntegrationEventsState {
    switch (action.type) {
        case constants.FETCH_HTTP_INTEGRATION_EVENTS_SUCCESS:
            return state.set('events', fromJS(action.events))

        case constants.FETCH_HTTP_INTEGRATION_EVENT_SUCCESS:
            return state.set('event', fromJS(action.event))

        default:
            return state
    }
}
