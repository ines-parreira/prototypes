import * as immutableMatchers from 'jest-immutable-matchers'

import * as selectors from 'state/infobarActions/bigcommerce/createOrder/selectors'
import {initialState} from 'state/infobarActions/bigcommerce/createOrder/reducers'
import {IntegrationType} from 'models/integration/types'
import {RootState} from 'state/types'

jest.addMatchers(immutableMatchers)

describe('infobarActions.bigcommerce.createOrder selectors', () => {
    let state: RootState

    beforeEach(() => {
        state = {
            infobarActions: {
                [IntegrationType.BigCommerce]: {
                    createOrder: initialState,
                },
            },
        } as RootState
    })

    describe('getCreateOrderState()', () => {
        it('should return create order state', () => {
            const result = selectors.getCreateOrderState(state)
            expect(result).toEqualImmutable(initialState)
        })
    })
})
