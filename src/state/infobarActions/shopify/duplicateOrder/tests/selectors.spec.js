import * as immutableMatchers from 'jest-immutable-matchers'

import {SHOPIFY_INTEGRATION_TYPE} from '../../../../../constants/integration'
import * as selectors from '../selectors'
import {initialState} from '../reducers'

jest.addMatchers(immutableMatchers)

describe('infobarActions.shopify.duplicateOrder selectors', () => {
    let state

    beforeEach(() => {
        state = {
            infobarActions: {
                [SHOPIFY_INTEGRATION_TYPE]: {
                    duplicateOrder: initialState,
                },
            },
        }
    })

    describe('getDuplicateOrderState()', () => {
        it('should return duplicate order state', () => {
            const result = selectors.getDuplicateOrderState(state)
            expect(result).toEqualImmutable(initialState)
        })
    })
})
