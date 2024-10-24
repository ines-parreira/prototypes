import {IntegrationType} from 'models/integration/types'
import {RootState} from 'state/types'

import {initialState} from '../reducers'
import * as selectors from '../selectors'

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
