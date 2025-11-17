import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import { TicketChannel } from 'business/types/ticket'
import { customer } from 'fixtures/customer'
import type { RootState } from 'state/types'

import { initialState } from '../reducers'
import * as selectors from '../selectors'

describe('customers selectors', () => {
    let state: RootState

    beforeEach(() => {
        state = {
            customers: initialState.mergeDeep({
                active: customer,
                items: [{ id: 1 }, { id: 2 }],
                _internal: {
                    loading: {
                        loader1: true,
                        loader2: false,
                    },
                },
            }),
        } as RootState
    })

    it('getCustomersState', () => {
        expect(selectors.getCustomersState(state)).toEqualImmutable(
            state.customers,
        )
        expect(selectors.getCustomersState({} as RootState)).toEqualImmutable(
            fromJS({}),
        )
    })

    it('getLoading', () => {
        expect(selectors.getLoading(state)).toEqualImmutable(
            selectors.getCustomersState(state).getIn(['_internal', 'loading']),
        )
        expect(selectors.getLoading({} as RootState)).toEqualImmutable(
            fromJS({}),
        )
    })

    it('getCustomers', () => {
        expect(selectors.getCustomers(state)).toEqualImmutable(
            selectors.getCustomersState(state).get('items'),
        )
        expect(selectors.getCustomers({} as RootState)).toEqualImmutable(
            fromJS([]),
        )
    })

    it('getActiveCustomer', () => {
        expect(selectors.getActiveCustomer(state)).toEqual(
            (
                selectors.getCustomersState(state).get('active') as Map<
                    any,
                    any
                >
            ).toJS(),
        )
        expect(
            selectors.getActiveCustomer({
                customers: fromJS({ active: {} }),
            } as RootState),
        ).toEqual({})
    })

    it('DEPRECATED_getActiveCustomer', () => {
        expect(selectors.DEPRECATED_getActiveCustomer(state)).toEqualImmutable(
            selectors.getCustomersState(state).get('active'),
        )
        expect(
            selectors.DEPRECATED_getActiveCustomer(fromJS({})),
        ).toEqualImmutable(fromJS({}))
    })

    it('getActiveCustomerId', () => {
        expect(selectors.getActiveCustomerId(state)).toEqualImmutable(
            selectors.getCustomersState(state).getIn(['active', 'id']),
        )
        expect(selectors.getActiveCustomerId({} as RootState)).toBe(undefined)
    })

    describe('makeGetActiveCustomerChannelsByType', () => {
        it('should return a filtered list of channels', () => {
            const getActiveCustomerEmailChannels =
                selectors.makeGetActiveCustomerChannelsByType([
                    TicketChannel.Email,
                ])

            expect(getActiveCustomerEmailChannels(state)).toMatchSnapshot()
        })
    })
})
