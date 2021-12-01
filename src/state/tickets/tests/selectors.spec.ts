import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import {RootState} from '../../types'
import * as selectors from '../selectors'
import {initialState} from '../reducers'

jest.addMatchers(immutableMatchers)

describe('selectors', () => {
    describe('tickets', () => {
        let state: RootState

        beforeEach(() => {
            state = {
                tickets: initialState.mergeDeep({
                    items: [{id: 1}],
                }),
            } as RootState
        })

        it('getTicketsState', () => {
            expect(selectors.getTicketsState(state)).toEqualImmutable(
                state.tickets
            )
            expect(selectors.getTicketsState({} as RootState)).toEqualImmutable(
                fromJS({})
            )
        })

        it('getTickets', () => {
            expect(selectors.getTickets(state)).toEqualImmutable(
                state.tickets.get('items')
            )
            expect(selectors.getTickets({} as RootState)).toEqualImmutable(
                fromJS([])
            )
        })

        describe('getCursor', () => {
            it('should get default cursor', () => {
                expect(selectors.getCursor(state)).toEqual(null)
                const newState = {
                    ticket: fromJS({}),
                } as RootState
                expect(selectors.getCursor(newState)).toEqual(null)
            })

            it('should get cursor value', () => {
                const cursor = '2018-03-07T00:42:49.336025'
                const newState = {
                    tickets: fromJS({cursor}),
                } as RootState
                expect(selectors.getCursor(newState)).toEqual(cursor)
            })
        })
    })
})
