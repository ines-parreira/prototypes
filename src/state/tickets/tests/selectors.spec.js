import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import * as selectors from '../selectors.ts'
import {initialState} from '../reducers.ts'

jest.addMatchers(immutableMatchers)

describe('selectors', () => {
    describe('tickets', () => {
        let state

        beforeEach(() => {
            state = {
                tickets: initialState.mergeDeep({
                    items: [{id: 1}],
                }),
            }
        })

        it('getTicketsState', () => {
            expect(selectors.getTicketsState(state)).toEqualImmutable(
                state.tickets
            )
            expect(selectors.getTicketsState({})).toEqualImmutable(fromJS({}))
        })

        it('getTickets', () => {
            expect(selectors.getTickets(state)).toEqualImmutable(
                state.tickets.get('items')
            )
            expect(selectors.getTickets({})).toEqualImmutable(fromJS([]))
        })

        describe('getCursor', () => {
            it('should get default cursor', () => {
                expect(selectors.getCursor({tickets: initialState})).toEqual(
                    null
                )
                const newState = {
                    ticket: fromJS({}),
                }
                expect(selectors.getCursor(newState)).toEqual(null)
            })

            it('should get cursor value', () => {
                const cursor = '2018-03-07T00:42:49.336025'
                const newState = {
                    tickets: fromJS({cursor}),
                }
                expect(selectors.getCursor(newState)).toEqual(cursor)
            })
        })
    })
})
