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

    it('fetch current products usage', () => {
        expect(
            reducer(initialState, {
                type: types.FETCH_CURRENT_PRODUCTS_USAGE_SUCCESS,
                resp: currentProductsUsage,
            }),
        ).toMatchSnapshot()
    })
})
