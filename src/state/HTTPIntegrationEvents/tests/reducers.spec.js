import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import reducer, {initialState} from '../reducers.ts'
import * as constants from '../constants'

jest.addMatchers(immutableMatchers)

describe('HTTPIntegrationEvents', () => {
    describe('reducers', () => {
        it('should set `events` value', () => {
            const events = [{id: 1}, {id: 2}]
            const action = {
                type: constants.FETCH_HTTP_INTEGRATION_EVENTS_SUCCESS,
                events,
            }
            const expectedState = initialState.set('events', fromJS(events))

            expect(reducer(initialState, action)).toEqualImmutable(
                expectedState
            )
        })

        it('should set `event` value', () => {
            const event = {id: 1}
            const action = {
                type: constants.FETCH_HTTP_INTEGRATION_EVENT_SUCCESS,
                event,
            }
            const expectedState = initialState.set('event', fromJS(event))

            expect(reducer(initialState, action)).toEqualImmutable(
                expectedState
            )
        })
    })
})
