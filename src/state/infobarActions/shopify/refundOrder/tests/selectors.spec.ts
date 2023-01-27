import * as immutableMatchers from 'jest-immutable-matchers'

import * as selectors from '../selectors'
import {initialState} from '../reducers'
import {IntegrationType} from '../../../../../models/integration/types'
import {RootState} from '../../../../types'

describe('infobarActions.shopify.refundOrder selectors', () => {
    let state: RootState

    beforeEach(() => {
        expect.extend(immutableMatchers)
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
