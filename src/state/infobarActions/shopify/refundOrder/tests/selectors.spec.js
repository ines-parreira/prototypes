import * as immutableMatchers from 'jest-immutable-matchers'

import {SHOPIFY_INTEGRATION_TYPE} from '../../../../../constants/integration.ts'
import * as selectors from '../selectors.ts'
import {initialState} from '../reducers.ts'

jest.addMatchers(immutableMatchers)

describe('infobarActions.shopify.refundOrder selectors', () => {
    let state

    beforeEach(() => {
        state = {
            infobarActions: {
                [SHOPIFY_INTEGRATION_TYPE]: {
                    refundOrder: initialState,
                },
            },
        }
    })

    describe('getRefundOrderState()', () => {
        it('should return refund order state', () => {
            const result = selectors.getRefundOrderState(state)
            expect(result).toEqualImmutable(initialState)
        })
    })
})
