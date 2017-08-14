import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import * as selectors from '../selectors'
import {initialState} from '../reducers'

jest.addMatchers(immutableMatchers)

describe('selectors', () => {
    describe('tickets', () => {
        let state

        beforeEach(() => {
            state = {
                tickets: initialState
                    .mergeDeep({
                        items: [{id: 1}],
                    })
            }
        })

        it('getTicketsState', () => {
            expect(selectors.getTicketsState(state)).toEqualImmutable(state.tickets)
            expect(selectors.getTicketsState({})).toEqualImmutable(fromJS({}))
        })

        it('getTickets', () => {
            expect(selectors.getTickets(state)).toEqualImmutable(state.tickets.get('items'))
            expect(selectors.getTickets({})).toEqualImmutable(fromJS([]))
        })
    })
})
