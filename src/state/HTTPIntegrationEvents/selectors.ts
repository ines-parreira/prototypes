import {createSelector} from 'reselect'
import {fromJS, List, Map} from 'immutable'

import {RootState} from '../types'

import {initialState} from './reducers'

export const getHTTPIntegrationEventsState = (state: RootState) =>
    state.HTTPIntegrationEvents || initialState

export const getHTTPIntegrationEvents = createSelector(
    getHTTPIntegrationEventsState,
    (state) => state.get('events', fromJS([])) as List<any>
)

export const getHTTPIntegrationEvent = createSelector(
    getHTTPIntegrationEventsState,
    (state) => state.get('event', fromJS({})) as Map<any, any>
)
