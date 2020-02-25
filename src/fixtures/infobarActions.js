import {fromJS} from 'immutable'

import {initialState as duplicateOrderInitialState} from '../state/infobarActions/shopify/duplicateOrder/reducers'
import type {DuplicateOrderState} from '../state/infobarActions/shopify/duplicateOrder/types'
import type {InfobarActionsState} from '../state/infobarActions/types'
import {SHOPIFY_INTEGRATION_TYPE} from '../constants/integration'

export const infobarActionsStateFixture = (
    duplicateOrderState: DuplicateOrderState = duplicateOrderInitialState
): InfobarActionsState => ({
    [SHOPIFY_INTEGRATION_TYPE]: {
        duplicateOrder: duplicateOrderState,
    },
})

export const duplicateOrderStateFixture = (
    {
        loading = false,
        payload = null,
        draftOrder = null,
        products = new Map(),
        defaultShippingLine = null,
    } = {}
): DuplicateOrderState => fromJS({
    loading,
    payload,
    draftOrder,
    products,
    defaultShippingLine,
})
