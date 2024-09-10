import {IntegrationType} from 'models/integration/types'
import {RootState} from 'state/types'

import * as selectors from '../selectors'
import {initialState} from '../reducers'

describe('infobarActions.shopify.refundOrder selectors', () => {
    let state: RootState

    beforeEach(() => {
        state = {
            infobarActions: {
                [IntegrationType.Shopify]: {
                    refundOrder: initialState,
                },
            },
        } as RootState
    })

    describe('getRefundOrderState()', () => {
        it('should return refund order state', () => {
            const result = selectors.getRefundOrderState(state)
            expect(result).toEqualImmutable(initialState)
        })
    })
})
