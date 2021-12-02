import {fromJS} from 'immutable'
import * as immutableMatchers from 'jest-immutable-matchers'

import {RootState} from '../../types'
import {
    getHTTPIntegrationEvent,
    getHTTPIntegrationEvents,
    getHTTPIntegrationEventsState,
} from '../selectors'
import {initialState} from '../reducers'

jest.addMatchers(immutableMatchers)

describe('HTTPIntegrationEvents', () => {
    describe('selectors', () => {
        describe('getHTTPIntegrationEventsState', () => {
            it('should return the initial state', () => {
                expect(getHTTPIntegrationEventsState({} as RootState)).toEqual(
                    initialState
                )
            })
            it('should return the value from the state', () => {
                const state = {
                    HTTPIntegrationEvents: fromJS({foo: 'bar'}),
                } as RootState
                expect(getHTTPIntegrationEventsState(state)).toEqualImmutable(
                    state.HTTPIntegrationEvents
                )
            })
        })

        describe('getHTTPIntegrationEvents', () => {
            it('should return the initial state', () => {
                expect(getHTTPIntegrationEvents({} as RootState)).toEqual(
                    fromJS([])
                )
            })
            it('should return the value from the state', () => {
                const state = {
                    HTTPIntegrationEvents: fromJS({events: {foo: 'bar'}}),
                } as RootState
                expect(getHTTPIntegrationEvents(state)).toEqualImmutable(
                    state.HTTPIntegrationEvents.get('events')
                )
            })
        })

        describe('getHTTPIntegrationEvent', () => {
            it('should return the initial state', () => {
                expect(getHTTPIntegrationEvent({} as RootState)).toEqual(
                    fromJS({})
                )
            })

            it('should return the value from the state', () => {
                const state = {
                    HTTPIntegrationEvents: fromJS({event: {foo: 'bar'}}),
                } as RootState
                expect(getHTTPIntegrationEvent(state)).toEqualImmutable(
                    state.HTTPIntegrationEvents.get('event')
                )
            })
        })
    })
})
