// @flow
import {createSelector} from 'reselect'
import type {stateType} from '../types'
import {initialState} from './reducers'
import {fromJS} from 'immutable'

export const getHTTPIntegrationEventsState = (state: stateType) => state.HTTPIntegrationEvents || initialState

export const getHTTPIntegrationEvents = createSelector(
    [getHTTPIntegrationEventsState],
    (state) => state.get('events', fromJS([]))
)

export const getHTTPIntegrationEvent = createSelector(
    [getHTTPIntegrationEventsState],
    (state) => state.get('event', fromJS({}))
)
