import expect from 'expect'
import expectImmutable from 'expect-immutable'

import {Map} from 'immutable'

import reducer from '../reducers'
import * as types from '../constants'

expect.extend(expectImmutable)

describe('reducers', () => {
    describe('systemMessage', () => {
        const initialState = Map()

        // Simulates a message system
        const message = {type: 'fake_type', header: 'fake_header', label: 'fake_label'}

        it('should return the initial state', () => {
            expect(
                reducer(undefined, {})
            ).toEqualImmutable(
                initialState
            )
        })

        it('should set the sent system message as state', () => {
            expect(
                reducer(initialState, {
                    type: types.SYSTEM_MESSAGE,
                    message,
                })
            ).toEqualImmutable(
                Map(message)
            )
        })

        it('should reset the system message with the initial state', () => {
            expect(
                reducer(Map(message), {
                    type: types.DISMISS_SYSTEM_MESSAGE,
                })
            ).toEqualImmutable(
                initialState
            )
        })
    })
})
