import * as immutableMatchers from 'jest-immutable-matchers'

import * as selectors from '../selectors'
import {initialState} from '../reducers'
import {IntegrationType} from '../../../../../models/integration/types'
import {RootState} from '../../../../types'

jest.addMatchers(immutableMatchers)

describe('infobarActions.shopify.createOrder selectors', () => {
    let state: RootState

    beforeEach(() => {
        state = {
            infobarActions: {
                [IntegrationType.Shopify]: {
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
