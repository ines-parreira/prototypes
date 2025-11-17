import { SHOPIFY_INTEGRATION_TYPE } from 'constants/integration'
import type { RootState } from 'state/types'

import { initialState } from '../reducers'
import * as selectors from '../selectors'

describe('infobarActions.shopify.cancelOrder selectors', () => {
    let state: RootState

    beforeEach(() => {
        state = {
            infobarActions: {
                [SHOPIFY_INTEGRATION_TYPE]: {
                    cancelOrder: initialState,
                },
            },
        } as RootState
    })

    describe('getCancelOrderState()', () => {
        it('should return cancel order state', () => {
            const result = selectors.getCancelOrderState(state)
            expect(result).toEqualImmutable(initialState)
        })
    })
})
