import {createSelector} from 'reselect'
import {fromJS, List, Map} from 'immutable'

import {RootState} from '../types'

import {initialState} from './reducers'
import {HTTPIntegrationEventsState} from './types'

export const getHTTPIntegrationEventsState = (state: RootState) =>
    state.HTTPIntegrationEvents || initialState

export const getHTTPIntegrationEvents = createSelector<
    RootState,
    List<any>,
    HTTPIntegrationEventsState
>(
    getHTTPIntegrationEventsState,
    (state) => state.get('events', fromJS([])) as List<any>
)

export const getHTTPIntegrationEvent = createSelector<
    RootState,
    Map<any, any>,
    HTTPIntegrationEventsState
>(
    getHTTPIntegrationEventsState,
    (state) => state.get('event', fromJS({})) as Map<any, any>
)
