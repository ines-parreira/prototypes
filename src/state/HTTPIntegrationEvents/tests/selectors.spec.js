import {fromJS} from 'immutable'
import * as immutableMatchers from 'jest-immutable-matchers'

import {
    getHTTPIntegrationEvent,
    getHTTPIntegrationEvents,
    getHTTPIntegrationEventsState,
} from '../selectors.ts'
import {initialState} from '../reducers.ts'

jest.addMatchers(immutableMatchers)

describe('HTTPIntegrationEvents', () => {
    describe('selectors', () => {
        describe('getHTTPIntegrationEventsState', () => {
            it('should return the initial state', () => {
                expect(getHTTPIntegrationEventsState({})).toEqual(initialState)
            })
            it('should return the value from the state', () => {
                const state = {HTTPIntegrationEvents: fromJS({foo: 'bar'})}
                expect(getHTTPIntegrationEventsState(state)).toEqualImmutable(
                    state.HTTPIntegrationEvents
                )
            })
        })

        describe('getHTTPIntegrationEvents', () => {
            it('should return the initial state', () => {
                expect(getHTTPIntegrationEvents({})).toEqual(fromJS([]))
            })
            it('should return the value from the state', () => {
                const state = {
                    HTTPIntegrationEvents: fromJS({events: {foo: 'bar'}}),
                }
                expect(getHTTPIntegrationEvents(state)).toEqualImmutable(
                    state.HTTPIntegrationEvents.get('events')
                )
            })
        })

        describe('getHTTPIntegrationEvent', () => {
            it('should return the initial state', () => {
                expect(getHTTPIntegrationEvent({})).toEqual(fromJS({}))
            })

            it('should return the value from the state', () => {
                const state = {
                    HTTPIntegrationEvents: fromJS({event: {foo: 'bar'}}),
                }
                expect(getHTTPIntegrationEvent(state)).toEqualImmutable(
                    state.HTTPIntegrationEvents.get('event')
                )
            })
        })
    })
})
