import * as immutableMatchers from 'jest-immutable-matchers'

import {SHOPIFY_INTEGRATION_TYPE} from '../../../../../constants/integration.ts'
import * as selectors from '../selectors.ts'
import {initialState} from '../reducers.ts'

jest.addMatchers(immutableMatchers)

describe('infobarActions.shopify.createOrder selectors', () => {
    let state

    beforeEach(() => {
        state = {
            infobarActions: {
                [SHOPIFY_INTEGRATION_TYPE]: {
                    createOrder: initialState,
                },
            },
        }
    })

    describe('getCreateOrderState()', () => {
        it('should return create order state', () => {
            const result = selectors.getCreateOrderState(state)
            expect(result).toEqualImmutable(initialState)
        })
    })
})
