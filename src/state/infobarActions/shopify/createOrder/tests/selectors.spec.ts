import * as immutableMatchers from 'jest-immutable-matchers'

import * as selectors from '../selectors'
import {initialState} from '../reducers'
import {IntegrationType} from '../../../../../models/integration/types'
import {RootState} from '../../../../types'

describe('infobarActions.shopify.createOrder selectors', () => {
    let state: RootState

    beforeEach(() => {
        expect.extend(immutableMatchers)
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
