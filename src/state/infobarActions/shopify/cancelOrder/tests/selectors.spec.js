import * as immutableMatchers from 'jest-immutable-matchers'

import {SHOPIFY_INTEGRATION_TYPE} from '../../../../../constants/integration'
import * as selectors from '../selectors'
import {initialState} from '../reducers'

jest.addMatchers(immutableMatchers)

describe('infobarActions.shopify.cancelOrder selectors', () => {
    let state

    beforeEach(() => {
        state = {
            infobarActions: {
                [SHOPIFY_INTEGRATION_TYPE]: {
                    cancelOrder: initialState,
                },
            },
        }
    })

    describe('getCancelOrderState()', () => {
        it('should return cancel order state', () => {
            const result = selectors.getCancelOrderState(state)
            expect(result).toEqualImmutable(initialState)
        })
    })
})
