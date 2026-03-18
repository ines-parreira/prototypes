import { fromJS } from 'immutable'

import { currentProductsUsage } from 'fixtures/plans'
import type { StoreAction } from 'state/types'

import * as types from '../constants'
import reducer, { initialState } from '../reducers'

describe('billing reducers', () => {
    it('initial state', () => {
        expect(reducer(undefined, {} as StoreAction)).toEqualImmutable(
            initialState,
        )
    })

    it('fetch invoices', () => {
        const invoices = [
            {
                metadata: {},
                paid: true,
                date: '2016-11-13T18:30:19+00:00',
                amount_due: 1234,
            },
        ]

        expect(
            reducer(initialState, {
                type: types.FETCH_INVOICES_SUCCESS,
                resp: invoices,
            }),
        ).toMatchSnapshot()
    })

    it('fetch current products usage', () => {
        expect(
            reducer(initialState, {
                type: types.FETCH_CURRENT_PRODUCTS_USAGE_SUCCESS,
                resp: currentProductsUsage,
            }),
        ).toMatchSnapshot()
    })

    describe('UPDATE_INVOICE_IN_LIST', () => {
        it('should update an invoice in the list of invoices. (existing invoice)', () => {
            const invoices = [
                {
                    id: 'in_1',
                    paid: false,
                },
                {
                    id: 'in_2',
                    paid: false,
                },
            ]
            const state = initialState.set('invoices', fromJS(invoices))
            const action = {
                type: types.UPDATE_INVOICE_IN_LIST,
                invoice: fromJS({ id: 'in_2', paid: true }),
            }
            expect(reducer(state, action)).toMatchSnapshot()
        })
    })
})
