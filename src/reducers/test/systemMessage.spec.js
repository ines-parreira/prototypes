import expect from 'expect'
import expectImmutable from 'expect-immutable'

import { Map } from 'immutable'

import { systemMessage } from '../systemMessage'
import * as actions from '../../actions/systemMessage'

expect.extend(expectImmutable)

describe('reducers', () => {
    describe('systemMessage', () => {
        const initialState = Map()

        it('should return the initial state', () => {
            expect(
                systemMessage(undefined, {})
            ).toEqualImmutable(
                initialState
            )
        })

        it('should set the sent system message as state', () => {
            const message = { type: 'fake_type', header: 'fake_header', label: 'fake_label'}

            expect(
                systemMessage([], {
                    type: actions.SYSTEM_MESSAGE,
                    message,
                })
            ).toEqualImmutable(
                Map(message)
            )
        })

        it('should reset the system message with the initial state', () => {
            expect(
                systemMessage([], {
                    type: actions.DISMISS_SYSTEM_MESSAGE,
                })
            ).toEqualImmutable(
                initialState
            )
        })
    })
})
